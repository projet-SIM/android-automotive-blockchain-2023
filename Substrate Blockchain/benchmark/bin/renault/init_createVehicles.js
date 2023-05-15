#!/usr/bin/env node

import * as child from 'child_process';
import * as path from 'path';
import * as os from 'os';

// if (process.argv.length <= 2) {
//     console.error("Required 3 argument: \n\twait_time, ex: 1 (sec)\n\tnb_processes, ex: 2")
//     process.exit(1);
// }
const cpuCount = os.cpus().length
const url = process.argv[2] // "ws://127.0.0.1:8844";  //renault
// const url = "ws://127.0.0.1:8843";  //insurance
// const url = "ws://substrate-ws.unice.cust.tasfrance.com";
const wait_time = 200; //parseFloat(process.argv[2]) * 1000;
const nb_processes = 10; //Math.round(cpuCount/1.5); //parseInt(process.argv[3]);
var processes_arr = [];
var processes_exited = 0;
var processes_init_ok = 0;
var processes_prepare_ok = 0;

var tot_success = 0;
var tot_failed = 0;
var tot_finished = 0;
var tot_prepared_finished = 0;

console.log("Settings:")
console.log("\t", nb_processes * (1 / (wait_time / 1000)), "Tx/sec (times the number of factories !)")
console.log("\t", nb_processes, "processes")
console.log("\t", wait_time, "wait time (ms)")

console.log("Send new vehicle...")
console.log("Start processes...")
// Create the worker.
for (let i = 0; i < nb_processes; i++) {
    processes_arr[i] = child.fork(path.join(".", "bin", "/sender_process.js"), [i, nb_processes, url]);


    //handle messages
    processes_arr[i].on('message', (message) => {
        if (message.cmd == "init_worker") { //first init all workers
            processes_arr[i].send({ cmd: "init" });
        }
        else if (message.cmd == "init_ok") { //wait all processes init ok
            processes_init_ok++;
            if (processes_init_ok == nb_processes) { //all processes ready
                //start send all processes 
                console.log("...all processes synced !")
                for (let j = 0; j < nb_processes; j++)
                    processes_arr[j].send({ cmd: "prepare", limit: -1 }); //start prepare
            }
        }
        else if (message.cmd == "prepare_ok") {
            processes_prepare_ok++;
            if (processes_prepare_ok == nb_processes) { //all processes ready
                //start send all processes 
                console.log("All processes prepared")
                console.log(`Total prepared finished: ${tot_prepared_finished}`)
                for (let j = 0; j < nb_processes; j++)
                    processes_arr[j].send({ cmd: "send", transaction_type: "new_car", wait_time: wait_time }); //start send
            }
        }
        else if (message.cmd == "prepare_stats") {
            tot_prepared_finished += message.finished;
        }
        else if (message.cmd == "send_stats") {
            console.log(JSON.stringify(message))
            tot_success += message.success;
            tot_failed += message.failed;
            tot_finished += message.finished;
        }
        else if (message.cmd == "send_ok") {
            processes_arr[i].send({ cmd: "exit" }); //exit when done
        }
    });


    //handle exit
    processes_arr[i].on('exit', () => {
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
