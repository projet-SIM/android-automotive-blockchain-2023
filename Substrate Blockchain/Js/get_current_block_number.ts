const renault_url = process.argv[2] || 'ws://127.0.0.1:8844' //"wss://renault.gerrits.xyz"

const node_type = process.argv[3] || 'renault' //"relaychain" or "renault" or "insurance"

import { cryptoWaitReady, } from '@polkadot/util-crypto';
import { parachainApi} from './common.js';

const myApp = async () => {
    await cryptoWaitReady();
    let ApiInst;
    switch (node_type) {
        case 'renault':
            ApiInst = await parachainApi(renault_url);
            break;
        default:
            ApiInst = await parachainApi(renault_url);
            break;
    }
    ApiInst.rpc.chain.getHeader().then((header) => {
        console.log(header.number.toString());
        process.exit(0);
    });
};

myApp()