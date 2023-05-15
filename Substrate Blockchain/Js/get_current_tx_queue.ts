const renault_url = process.argv[2] || 'ws://127.0.0.1:8844' //"wss://renault.gerrits.xyz"

import { cryptoWaitReady, } from '@polkadot/util-crypto';
import { parachainApi} from './common.js';

const myApp = async () => {
    await cryptoWaitReady();
    let total_pending_tx = 0;
    const parachainApiInstRenault = await parachainApi(renault_url);

    parachainApiInstRenault.rpc.author.pendingExtrinsics().then((list) => {
        total_pending_tx += list.length;
    }).then(() => {
        console.log(total_pending_tx);
        process.exit(0);
    }).catch((err) => {
        console.log(err);
    })

};

myApp()