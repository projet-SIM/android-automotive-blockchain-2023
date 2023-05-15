#!/usr/bin/env node

// Import
import substrate_sim from "./substrate_sim_lib.js";
import { writeFileSync, unlinkSync, existsSync } from 'fs'
const filename_vehicles = "vehicles.json"
const filename_factories = "factories.json"
const filename_drivers = "drivers.json"

if (process.argv.length <= 3) {
    console.error("Required 2 argument: \n\tnumber of accounts to generate. Ex: 1000\n\tnumber of factory accounts to generate. Ex: 10")
    process.exit(1);
}

async function main() {
    console.log("Start genAccounts.js...")
    console.log("Delete old file...")
    if (existsSync(filename_vehicles)) {
        unlinkSync(filename_vehicles);
    }
    if (existsSync(filename_factories)) {
        unlinkSync(filename_factories);
    }
    if (existsSync(filename_drivers)) {
        unlinkSync(filename_drivers);
    }
    // ----------------------------------------------------------------------------------------------------------
    const vehicle_account_pair_size = parseInt(process.argv[2]);
    console.log(`Creating ${vehicle_account_pair_size} vehicle accounts...`)
    var VEHICLE_ACCOUNT_PAIRS = [];
    for (let i = 0; i < vehicle_account_pair_size; i++) {
        //console.clear();
        //console.log(`Loading account list ${i * 100 / vehicle_account_pair_size}%`)
        VEHICLE_ACCOUNT_PAIRS.push(substrate_sim.accounts.genMnemonic())
    }
    writeFileSync(filename_vehicles, JSON.stringify(VEHICLE_ACCOUNT_PAIRS, null, 1), { encoding: "utf8", flag: "a+" })

    // ----------------------------------------------------------------------------------------------------------
    const factory_account_pair_size = parseInt(process.argv[3]);
    console.log(`Creating ${factory_account_pair_size} factory accounts...`)
    var FACTORY_ACCOUNT_PAIRS = [];
    for (let i = 0; i < factory_account_pair_size; i++) {
        //console.clear();
        //console.log(`Loading factory account list ${i * 100 / factory_account_pair_size}%`)
        FACTORY_ACCOUNT_PAIRS.push(substrate_sim.accounts.genMnemonic())
    }
    writeFileSync(filename_factories, JSON.stringify(FACTORY_ACCOUNT_PAIRS, null, 1), { encoding: "utf8", flag: "a+" })

    // ----------------------------------------------------------------------------------------------------------
    const driver_account_pair_size = vehicle_account_pair_size; // parseInt(process.argv[4]); //number of vehicles == number of drivers
    console.log(`Creating ${driver_account_pair_size} driver accounts...`)
    var DRIVER_ACCOUNT_PAIRS = [];
    for (let i = 0; i < driver_account_pair_size; i++) {
        //console.clear();
        //console.log(`Loading factory account list ${i * 100 / driver_account_pair_size}%`)
        DRIVER_ACCOUNT_PAIRS.push(substrate_sim.accounts.genMnemonic())
    }
    writeFileSync(filename_drivers, JSON.stringify(DRIVER_ACCOUNT_PAIRS, null, 1), { encoding: "utf8", flag: "a+" })

    console.log("Done")
}

main().catch(console.error).finally(() => process.exit(0));