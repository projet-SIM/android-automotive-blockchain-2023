//Renault chain (2000): ws://127.0.0.1:8844 
//Insurance chain (3000): ws://127.0.0.1:8843
//Roccoco local test net: ws://127.0.0.1:9977
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Run like:
// #first compile it, than run it:
// node get_block_stats.js <start_block> <end_block> <output_file_prefix> <relaychain_url> <renault_url> <insurance_url>
// node get_block_stats.js 450 400 "my_test_100tps_" "wss://relaychain.gerrits.xyz" "wss://renault.gerrits.xyz" "wss://insurance.gerrits.xyz"
import '@polkadot/api-augment';
import '@polkadot/rpc-augment';
import '@polkadot/types-augment';
import { cryptoWaitReady, } from '@polkadot/util-crypto';
import { parachainApi, log } from './common.js';
import * as fs from 'fs';
import moment from 'moment';
let start_block_nb = parseInt(process.argv[2]) || -1; //0
let stop_block_nb = parseInt(process.argv[3]) || -1; //0
let file_prefix = process.argv[4] || "";
const renault_url = process.argv[5] || 'ws://127.0.0.1:8844'; //"wss://renault.gerrits.xyz"
const node_type = process.argv[6] || 'renault'; //"relaychain" or "renault" or "insurance"
const myApp = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    yield cryptoWaitReady();
    let api;
    switch (node_type) {
        case 'renault':
            api = yield parachainApi(renault_url);
            break;
        default:
            api = yield parachainApi(renault_url);
            break;
    }
    const allRecords = yield api.query.system.events();
    if (start_block_nb === -1 && stop_block_nb === -1)
        log("Getting blocks from 0 to end.");
    else
        log("Getting from block " + start_block_nb + " to " + stop_block_nb + " block.");
    let csv_separator = ",";
    // console.log(process.argv[1])
    let path_prefix = "results/block_logs/";
    if (!fs.existsSync(path_prefix))
        fs.mkdirSync(path_prefix);
    const chain_name = (yield api.rpc.system.chain()).toString();
    log("Chain: " + chain_name);
    let filename_blockstats = path_prefix + file_prefix + "block_stats_" + chain_name + ".csv";
    if (fs.existsSync(filename_blockstats))
        fs.unlinkSync(filename_blockstats);
    // make CSV headers
    fs.appendFileSync(filename_blockstats, "block" + csv_separator + "timestamp" + csv_separator + "blocktime" + csv_separator + "transactions" + csv_separator + "tps" + csv_separator + "events" + "\n");
    let rows_blocktime = [];
    let current_block_number = 0;
    let current_block_data; // = await api.derive.chain.getBlockByNumber(0);
    let block_nb = 0;
    if (start_block_nb === -1 && stop_block_nb === -1) {
        //if no param is given, start from 0
        block_nb = 0; //can we go back that much ? if yes use param
        current_block_number = yield (yield api.derive.chain.bestNumberFinalized()).toNumber();
    }
    else {
        block_nb = start_block_nb;
        current_block_number = stop_block_nb + 2;
    }
    let previous_time = '0';
    // log("Current block is #" + current_block_number)
    while (block_nb != current_block_number) {
        // log("#" + block_nb)
        current_block_data = yield api.derive.chain.getBlockByNumber(block_nb);
        if (((_a = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _a === void 0 ? void 0 : _a.extrinsics) && ((_b = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _b === void 0 ? void 0 : _b.extrinsics.length) > 0) {
            // log(current_block_data?.block?.extrinsics)
            (_c = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _c === void 0 ? void 0 : _c.extrinsics.map((extrinsic_list, index, arr) => __awaiter(void 0, void 0, void 0, function* () {
                var _d, _e, _f, _g, _h;
                // store the timestamp in file
                if ((index === 0 && chain_name === "Rococo Local Testnet") // timestamp pallet has different index depending the runtime
                    || (index === 0 && chain_name != "Rococo Local Testnet")) {
                    let current_time = extrinsic_list.args.toString();
                    if (previous_time !== '0') { //can only calculate block time for blocks > 1
                        const apiAt = yield api.at((_d = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _d === void 0 ? void 0 : _d.hash);
                        const events = yield apiAt.query.system.events();
                        let diff = parseInt(current_time) - parseInt(previous_time);
                        rows_blocktime.push([block_nb, current_time, (diff / 1000), (_e = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _e === void 0 ? void 0 : _e.extrinsics.length, (((_f = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _f === void 0 ? void 0 : _f.extrinsics.length) / (diff / 1000)), events.length]);
                        // let data = block_nb + csv_separator + (diff / 1000).toString() + "\n"
                        // fs.appendFileSync(filename_blockstats, data)
                        // events.map((event, index) => {
                        //     console.log(JSON.stringify(event, null, 2))
                        // })
                        let log_separator = "\t";
                        console.log("Block " + block_nb + log_separator + moment(parseInt(current_time)).format('YYYY-MM-DD HH:mm:ss') + log_separator + (diff / 1000).toFixed(2).toString() + " s" + log_separator + ((_g = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _g === void 0 ? void 0 : _g.extrinsics.length) + " extrinsics" + log_separator + (((_h = current_block_data === null || current_block_data === void 0 ? void 0 : current_block_data.block) === null || _h === void 0 ? void 0 : _h.extrinsics.length) / (diff / 1000)).toFixed(2).toString() + " tps" + log_separator + events.length + " events\r");
                    }
                    previous_time = current_time;
                }
                // log(extrinsic_list.data.toString())
                // log(index)
                // log(arr.toString())
            }));
            // current_block_data?.block?.extrinsics.forEach(({ method: { method, section } }, index) => {
            //     // filter the specific events based on the phase and then the
            //     // index of our extrinsic in the block
            //     const events = allRecords
            //         .filter(({ phase }) =>
            //             phase.isApplyExtrinsic &&
            //             phase.asApplyExtrinsic.eq(index)
            //         )
            //         .map(({ event }) => `${event.section}.${event.method}`);
            //     console.log(`${section}.${method}:: ${events.join(', ') || 'no events'}`);
            // });
            // console.log(JSON.stringify(current_block_data, null, 2))
        }
        block_nb = block_nb + 1;
        // stop at the same height as smallest parachain block height
        // if (chain_name === "Rococo Local Testnet" && block_nb > block_min)
        //     break;
    }
    // Get the smallest parachain block height
    // if (block_min == -1 && chain_name != "Rococo Local Testnet")
    //     block_min = block_nb
    // if (block_min > block_nb && chain_name != "Rococo Local Testnet")
    //     block_min = block_nb
    let csvContent_blocktime = "";
    rows_blocktime.forEach(function (rowArray) {
        let row = rowArray.join(csv_separator);
        csvContent_blocktime += row + "\n";
    });
    fs.appendFileSync(filename_blockstats, csvContent_blocktime);
    log("Done");
    process.exit(0);
});
myApp();
