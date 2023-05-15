#!/usr/bin/env node

import substrate_sim from "../substrate_sim_lib.js";
import * as os from 'os';

// if (process.argv.length <= 2) {
//     console.error("Required 3 argument: \n\twait_time, ex: 1 (sec)\n\tnb_processes, ex: 2")
//     process.exit(1);
// }
const cpuCount = os.cpus().length
const url = process.argv[2] // "ws://127.0.0.1:8844";  //renault
// const url = "ws://127.0.0.1:8843";  //insurance
// const url = "ws://substrate-ws.unice.cust.tasfrance.com";


//init
var api = await substrate_sim.initApi(url);
substrate_sim.accounts.makeAllFactories()

const factory_array = substrate_sim.accounts.getAllFactories();
console.log("Send new factory...")
// await substrate_sim.sleep(2000); //wait a little
var is_some_added = false;
for (let i = 0; i < factory_array.length; i++) {
    var already_factory = await substrate_sim.print_factories(api, factory_array[i].address);
    try {
        if (already_factory) {
            console.log(`Already factory:\t ${factory_array[i].address}`)
        } else {
            await substrate_sim.send.new_factory(api, factory_array[i]); //alice is factory
            is_some_added = true;
            await substrate_sim.sleep(300); //wait a little: get error "tx outdated" when one account sends too many tx/sec
        }
    } catch (e) {
        console.log("Init factory failed. Maybe already there or concurrent process already send it.")
        console.log(e)
    }
}
process.exit(0)