//
//A lib to simplify my life with our use case and Substrate
//
import { Keyring } from '@polkadot/keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import additionalTypes from "../additional_types.js";
import { createHash, randomBytes } from 'crypto';
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { readFileSync, existsSync } from 'fs'
const filename_vehicles = "vehicles.json"
const filename_factories = "factories.json"
const filename_drivers = "drivers.json"

// init keyring
var keyring;
// init alice and charlie accounts
var alice;
var bob;
var charlie;

var VEHICLES_PAIRS = {};
var VEHICLES_PAIRS_NONCES = {};

var FACTORIES_PAIRS = {};
var FACTORIES_PAIRS_NONCES = {};

var DRIVERS_PAIRS = {}
var DRIVERS_PAIRS_NONCES = {}


async function get_balance(api, address) {
    let { data: balance } = await api.query.system.account(address);
    return balance.free.toBigInt();
}

async function get_sudo_keyPair(api) {
    let key = await api.query.sudo.key();
    return keyring.getPair(key.toString());
}

async function get_factory(api, factory_address) {
    let data = await api.query.palletSimRenault.factories(factory_address);
    return data;
}

async function get_cars(api) {
    let data = await api.query.palletSimRenault.cars.keys();
    let a = data.map(({ args: [carId] }) => carId);
    return a;
}

async function get_car(api, car_id) {
    let data = await api.query.palletSimRenault.cars(car_id);
    return data;
}

async function get_crashes(api) {
    let data = await api.query.palletSimRenault.crashes.keys();
    let a = data.map(({ args: [carId] }) => carId);
    return a;
}

async function get_crash(api, car_id) {
    let data = await api.query.palletSimRenault.crashes(car_id);
    return data;
}

function getKeyring() {
    return keyring;
}

var substrate_sim = {
    initApi: async function (url) { //if a process if given then we only get a piece of the accounts        
        // Construct
        const wsProvider = new WsProvider(url, 10000, null, 500000);

        await cryptoWaitReady();
        keyring = new Keyring({ type: 'sr25519' });

        // init alice and charlie accounts
        alice = getKeyring().addFromUri('//Alice', { name: 'Alice default' });
        bob = getKeyring().addFromUri('//Bob', { name: 'Bob default' });
        charlie = getKeyring().addFromUri('//Charlie', { name: 'Charlie default' });

        // substrate_sim.accounts.makeAll(process_id, tot_processes) //init all accounts

        const api = await ApiPromise.create({ provider: wsProvider, types: additionalTypes });

        VEHICLES_PAIRS[0] = [];
        FACTORIES_PAIRS[0] = [];
        DRIVERS_PAIRS[0] = [];

        // await this.sleep(2000)
        return api;
    },
    accounts: {
        alice: () => { return alice; },
        bob: () => { return bob; },
        charlie: () => { return charlie; },
        genMnemonic: () => {
            return mnemonicGenerate();
        },
        genFromMnemonic: (mnemonic, name) => {
            //TODO: maybe use createFromUri ???
            // https://polkadot.js.org/docs/keyring/start/create/#revisiting-crypto
            return getKeyring().createFromUri(mnemonic, { name: name }, 'ed25519');
        },
        makeAll: (process_id = -1, tot_processes = -1) => {
            substrate_sim.accounts.makeAllFactories(process_id, tot_processes);
            substrate_sim.accounts.makeAllVehicles(process_id, tot_processes);
            substrate_sim.accounts.makeAllDrivers(process_id, tot_processes);
        },
        makeAllFactories: (process_id = -1, tot_processes = -1) => {
            if (existsSync(filename_factories)) {
                var file_content = readFileSync(filename_factories, 'utf-8');
                try {
                    var file_json_arr = JSON.parse(file_content);
                    var tot_accounts = file_json_arr.length;

                    if (process_id == -1 || tot_processes == -1) {
                        console.log("Loading all factory accounts...");
                        FACTORIES_PAIRS[0] = [];
                        FACTORIES_PAIRS_NONCES[0] = [];
                        for (let i = 0; i < tot_accounts; i++) {
                            // if (i % 500 == 0)
                            //     console.log(`\n${(i * 100) / tot_accounts}%`)
                            FACTORIES_PAIRS[0].push(substrate_sim.accounts.genFromMnemonic(file_json_arr[i], `Factory Account ${i}`))
                            FACTORIES_PAIRS_NONCES[0].push(0); //init 0
                        }
                    } else {
                        var account_count = parseInt(tot_accounts / tot_processes);
                        var account_start_index = process_id;
                        FACTORIES_PAIRS[process_id] = [];
                        FACTORIES_PAIRS_NONCES[process_id] = [];
                        for (let i = (account_start_index * account_count); i < ((account_start_index + 1) * account_count); i++) {
                            FACTORIES_PAIRS[process_id].push(substrate_sim.accounts.genFromMnemonic(file_json_arr[i], `Factory Account ${i}`))
                            FACTORIES_PAIRS_NONCES[process_id].push(0); //init 0
                        }
                    }
                } catch (e) {
                    console.log(e);
                    console.log("Can't load factory account file: " + filename_vehicles);
                }

            } else {
                console.error(`${filename_factories} doesn't exist. Use genAccounts.js to build one.`)
                process.exit(1);
            }
        },
        makeAllVehicles: (process_id = -1, tot_processes = -1) => {
            if (existsSync(filename_vehicles)) {
                var file_content = readFileSync(filename_vehicles, 'utf-8');
                try {
                    var file_json_arr = JSON.parse(file_content);
                    var tot_accounts = file_json_arr.length;

                    if (process_id == -1 || tot_processes == -1) {
                        console.log("Loading all accounts...");
                        VEHICLES_PAIRS[0] = [];
                        VEHICLES_PAIRS_NONCES[0] = [];
                        for (let i = 0; i < tot_accounts; i++) {
                            // if (i % 500 == 0)
                            //     console.log(`\n${(i * 100) / tot_accounts}%`)
                            VEHICLES_PAIRS[0].push(substrate_sim.accounts.genFromMnemonic(file_json_arr[i], `Account ${i}`))
                            VEHICLES_PAIRS_NONCES[0].push(0); //init 0
                        }
                    } else {
                        var account_count = parseInt(tot_accounts / tot_processes);
                        var account_start_index = process_id;
                        VEHICLES_PAIRS[process_id] = [];
                        VEHICLES_PAIRS_NONCES[process_id] = [];
                        for (let i = (account_start_index * account_count); i < ((account_start_index + 1) * account_count); i++) {
                            VEHICLES_PAIRS[process_id].push(substrate_sim.accounts.genFromMnemonic(file_json_arr[i], `Account ${i}`))
                            VEHICLES_PAIRS_NONCES[process_id].push(0); //init 0
                        }
                    }
                } catch (e) {
                    console.log(e);
                    console.log("Can't load account file: " + filename_vehicles);
                }
            } else {
                console.error(`${filename_vehicles} doesn't exist. Use genAccounts.js to build one.`)
                process.exit(1);
            }
        },
        makeAllDrivers: (process_id = -1, tot_processes = -1) => {
            if (existsSync(filename_drivers)) {
                var file_content = readFileSync(filename_drivers, 'utf-8');
                try {
                    var file_json_arr = JSON.parse(file_content);
                    var tot_accounts = file_json_arr.length;

                    if (process_id == -1 || tot_processes == -1) {
                        console.log("Loading all accounts...");
                        DRIVERS_PAIRS[0] = [];
                        DRIVERS_PAIRS_NONCES[0] = [];
                        for (let i = 0; i < tot_accounts; i++) {
                            // if (i % 500 == 0)
                            //     console.log(`\n${(i * 100) / tot_accounts}%`)
                            DRIVERS_PAIRS[0].push(substrate_sim.accounts.genFromMnemonic(file_json_arr[i], `Driver ${i}`))
                            DRIVERS_PAIRS_NONCES[0].push(0); //init 0
                        }
                    } else {
                        var account_count = parseInt(tot_accounts / tot_processes);
                        var account_start_index = process_id;
                        DRIVERS_PAIRS[process_id] = [];
                        DRIVERS_PAIRS_NONCES[process_id] = [];
                        for (let i = (account_start_index * account_count); i < ((account_start_index + 1) * account_count); i++) {
                            DRIVERS_PAIRS[process_id].push(substrate_sim.accounts.genFromMnemonic(file_json_arr[i], `Driver ${i}`))
                            DRIVERS_PAIRS_NONCES[process_id].push(0); //init 0
                        }
                    }
                } catch (e) {
                    console.log(e);
                    console.log("Can't load account file: " + filename_drivers);
                }
            } else {
                console.error(`${filename_drivers} doesn't exist. Use genAccounts.js to build one.`)
                process.exit(1);
            }
        },
        getAllVehicles: (process_id = -1) => {
            if (process_id == -1)
                return VEHICLES_PAIRS[0];
            return VEHICLES_PAIRS[process_id];
        },
        getAllFactories: (process_id = -1) => {
            if (process_id == -1)
                return FACTORIES_PAIRS[0];
            return FACTORIES_PAIRS[process_id];
        },
        getAllVehiclesNonces: (process_id = -1) => {
            if (process_id == -1)
                return VEHICLES_PAIRS_NONCES[0];
            return VEHICLES_PAIRS_NONCES[process_id];
        },
        getAllFactoriesNonces: (process_id = -1) => {
            if (process_id == -1)
                return FACTORIES_PAIRS_NONCES[0];
            return FACTORIES_PAIRS_NONCES[process_id];
        },
        getAllDrivers: (process_id = -1) => {
            if (process_id == -1)
                return DRIVERS_PAIRS[0];
            return DRIVERS_PAIRS[process_id];
        },
        getAllDriversNonces: (process_id = -1) => {
            if (process_id == -1)
                return DRIVERS_PAIRS_NONCES[0];
            return DRIVERS_PAIRS_NONCES[process_id];
        }

    },
    print_factories: async function (api, factory_address) {
        var factory = await get_factory(api, factory_address);
        if (factory && !factory.toString()) {
            console.log(`[+] ${factory_address} is NOT a factory.`)
            return false;
        } else {
            let factory_blockHash = await api.rpc.chain.getBlockHash(factory.toString());
            console.log(`[+] ${factory_address} is a factory.\n\tAdded in block number: ${factory.toString()}\n\tBlock Hash: ${factory_blockHash}"`);
            return true;
        }
    },
    print_cars: async function (api, expand = false) {
        var cars = await get_cars(api);
        console.log(`[+] Stored cars: ${Object.keys(cars).length}`);
        if (expand) {
            for (const [key, car_id] of Object.entries(cars)) {
                let car = await get_car(api, car_id);
                console.log(`[+] Car: ${car_id}\n\tAdded by: ${car[0]}\n\tJoined on block: ${car[1]}`);
            }
        }
    },
    print_crashes: async function (api) {
        var crashes = await get_crashes(api);
        console.log(`[+] Stored cars that had crashed at least once: ${Object.keys(crashes).length}`);

        for (const [key, car_id] of Object.entries(crashes)) {
            let car_crashes = await get_crash(api, car_id);
            // console.log(`[+] Car: ${car_id} \n\t${car_crashes}`);
            console.log(`[+] Car: ${car_id}`);
            console.log(`\t-Total crashes: ${car_crashes.length}`);
            for (const crash of car_crashes) {
                console.log(`\t\tCrashed at block: ${crash.block_number}`);
                console.log(`\t\tData hash ${crash.data}\n`);
            }
        }
    },
    print_header: async (api, process_id = -1, tot_processes = -1) => {
        // Retrieve the last timestamp
        const now = await api.query.timestamp.now();
        const now_human = new Date(now.toNumber()).toISOString();
        // Genesis Hash
        const genesisHash = api.genesisHash.toHex()
        const last_block = await api.rpc.chain.getHeader();
        console.log("---------------------------------------------------------------------------------------------");
        console.log(`[+] Genesis Hash: ${genesisHash}`);
        console.log(`[+] Node time: ${now} (${now_human})`);
        console.log(`[+] Last block: ${last_block.number.toString()} -> ${last_block.hash.toString()}`);
        console.log(`[+] Accounts:`);
        console.log(`\t Alice:\t\t${substrate_sim.accounts.alice().address}`);
        console.log(`\t Bob:\t\t${substrate_sim.accounts.bob().address}`);
        console.log(`\t Charlie:\t${substrate_sim.accounts.charlie().address}`);
        console.log(`[+] Auto generated vehicles: ${substrate_sim.accounts.getAllVehicles(process_id).length}`);
        console.log(`[+] Auto generated factories accounts: ${substrate_sim.accounts.getAllFactories(process_id).length}`);
        console.log(`[+] Auto generated drivers accounts: ${substrate_sim.accounts.getAllDrivers(process_id).length}`);
        console.log("---------------------------------------------------------------------------------------------");

    },
    send: {
        prepare_report_accident_renault: async function (api, car, nonce = -1, verbose = false) {
            const tx = api.tx.palletSimRenaultAccident
                .reportAccident("0x64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c") //data_sha256sum
            // const tx_signed = tx.sign(car, { nonce: nonce , era: 0 });
            const tx_signed = await tx.signAsync(car, { nonce: nonce, era: 0 });
            if (verbose)
                console.log(`Transaction sent: ${tx}`);
            return tx_signed;
        },
        prepare_report_accident_insurance: async function (api, driver, car, nonce = -1, verbose = false) {
            const tx = api.tx.palletSimInsuranceAccident
                .reportAccident(car.address, 1)
            // const tx_signed = tx.sign(driver, { nonce: nonce , era: 0 });
            const tx_signed = await tx.signAsync(driver, { nonce: nonce, era: 0 });
            if (verbose)
                console.log(`Transaction sent: ${tx}`);
            return tx_signed;
        },
        report_accident_insurance: async function (api, car, nonce = -1, verbose = false) {
            // var data = "Hello world";
            // const hash = createHash('sha256');
            // hash.update(data);
            // var data_sha256sum = hash.digest().toString();
            // Sign and send a new crash from Bob car
            const tx = await api.tx.palletSimRenaultAccident
                .reportAccident("0x64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c") //data_sha256sum
                .signAndSend(car,
                    { nonce: nonce },
                );
            if (verbose)
                console.log(`Transaction sent: ${tx}`);
            return tx;
        },
        new_factory: async function (api, factory) {
            // https://polkadot.js.org/docs/api/start/api.tx.wrap/#sudo-use
            const sudoPair = await get_sudo_keyPair(api);
            // const { nonce } = await api.query.system.account(sudoPair.address);
            // console.log(`nonce: ${nonce}`)
            let tx = await api.tx.sudo.sudo(
                api.tx.palletSimRenault.createFactory(factory.address)
            ).signAndSend(sudoPair, { nonce: -1 });

            //not used because we set pallet weight to 0
            // tx = await api.tx.sudo.sudo(
            //     api.tx.balances.setBalance(
            //         { Id: factory.address }, //who: 
            //         1000000000000, //newFree: 1000000,
            //         1000000000000, //newReserved: 0
            //     )
            // ).signAndSend(sudoPair, { nonce: -1 });

            console.log(`Transaction sent: ${tx}`);
            return tx;
        },
        new_car: async function (api, factory, car, nonce = -1) {
            let tx = await api.tx.palletSimRenault
                .createVehicle(car.address)
                .signAndSend(factory,
                    { nonce: nonce },
                );
            // console.log(`Transaction sent: ${tx}`);
            return tx;
        },
        init_car: async function (api, car, nonce = -1) {
            let tx = await api.tx.palletSimRenault
                .initVehicle(car.address)
                .signAndSend(car,
                    { nonce: nonce },
                );
            // console.log(`Transaction sent: ${tx}`);
            return tx;
        },
        signup: async function (api, driver, signup_json, nonce = -1) {
            let tx = await api.tx.palletSimInsurance
                .signUp(signup_json)
                .signAndSend(driver,
                    { nonce: nonce },
                );
            // console.log(`Transaction sent: ${tx}`);
            return tx;
        },
        // new_owner: async function (api, sudo_account, car) {
        //     // https://polkadot.js.org/docs/api/start/api.tx.wrap/#sudo-use
        //     let tx = await api.tx.sudo(
        //         api.tx.simModule.storeCar(car.address)
        //     ).signAndSend(sudo_account, { nonce: -1 });
        //     console.log(`Transaction sent: ${tx}`);
        // }
    },
    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    getLastBlock: async (api) => {
        return await api.rpc.chain.getHeader();
    }
}

export default substrate_sim = substrate_sim