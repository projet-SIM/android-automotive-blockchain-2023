#!/usr/bin/env node

import * as child from 'child_process';
import * as path from 'path';
import * as async from "async";

if (process.argv.length <= 3) {
    console.error("Required 2 argument: \n\tlimit, ex: 10000\n\ttx/sec, ex: 10 (tx/sec)\n\tnb_processes, ex: 10 (optional)")
    process.exit(1);
}
const transaction_type = process.argv[5] //get the type of tx we want to test (renault or insurance report accidents)
//change url acordingly:
const url = process.argv[6] //transaction_type == "report_accident_renault" ? "ws://127.0.0.1:8844" : (transaction_type == "report_accident_insurance" ? "ws://127.0.0.1:8843": "");  //renault

// const url = "ws://127.0.0.1:8844";  //renault
// const url = "ws://127.0.0.1:8843";  //insurance
// const url = "ws://substrate-ws.unice.cust.tasfrance.com";

const limit = parseInt(process.argv[2]);
const nb_processes = process.argv[4] ? parseInt(process.argv[4]) : 14; //parseInt(process.argv[4]);
const wait_time = (nb_processes / parseFloat(process.argv[3])) * 1000;// parseFloat(process.argv[3]) * 1000;

var processes_arr = [];
var processes_exited = 0;
var processes_finished = 0;
var processes_init_ok = 0;
var processes_prepare_ok = 0;

var tot_success = 0;
var tot_failed = 0;
var tot_finished = 0;
var tot_prepared_finished = 0;


console.log("Benchmark settings:")
// console.log("\t", nb_processes * (1 / parseFloat(process.argv[3])), "Tx/sec")
console.log("\t", parseFloat(process.argv[3]), "Tx/sec")
console.log("\t wait_time=", wait_time, "ms (in each thread)")
console.log("\t nb threads=", nb_processes, "threads")
console.log("\t limit=", limit, "tx")
console.log("\t url=", url)
console.log("Start processes")
// Create the worker.
for (let i = 0; i < nb_processes; i++) {
    processes_arr[i] = child.fork(path.join(".", "bin", "/sender_process.js"), [i, nb_processes, url]);


    //handle messages
    processes_arr[i].on('message', async (message) => {
        if (message.cmd == "init_worker") { //first init all workers
            processes_arr[i].send({ cmd: "init" });
        }
        else if (message.cmd == "init_ok") { //wait all processes init ok
            processes_init_ok++;
            if (processes_init_ok == nb_processes) { //all processes ready
                //start send all processes 
                console.log("All processes synced")
                for (let j = 0; j < nb_processes; j++)
                    processes_arr[j].send({ cmd: "prepare", transaction_type: transaction_type, limit: parseInt(limit / nb_processes) }); //start send
            }
        }
        else if (message.cmd == "prepare_ok") {
            processes_prepare_ok++;
            if (processes_prepare_ok == nb_processes) { //all processes ready
                //start send all processes 
                console.log("All processes prepared")
                console.log(`Total prepared finished: ${tot_prepared_finished}`)
                for (let j = 0; j < nb_processes; j++)
                    processes_arr[j].send({ cmd: "send", transaction_type: transaction_type, wait_time: wait_time }); //start send
            }
        }
        else if (message.cmd == "prepare_stats") {
            tot_prepared_finished += message.finished;
        }
        else if (message.cmd == "send_stats") {
            // console.log(JSON.stringify(message))
            // console.log(message)
            tot_success += message.success;
            tot_failed += message.failed;
            tot_finished += message.finished;
        }
        else if (message.cmd == "send_ok") {
            processes_arr[i].send({ cmd: "exit" }); //exit when done
        }
    });


    //handle exit
    processes_arr[i].on('exit', async () => {
        //proccess exit
        processes_exited++;
        if (processes_exited == nb_processes) {
            //if all processes exited -> stop main process
            console.log("All processes exited.")
            console.log("Done main worker")

            console.log(`Total success: ${tot_success}`)
            console.log(`Total failed: ${tot_failed}`)
            console.log(`Total finished: ${tot_finished}`)

            process.exit(0);
        }
    });
}
