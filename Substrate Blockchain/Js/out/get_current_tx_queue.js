var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const renault_url = process.argv[2] || 'ws://127.0.0.1:8844'; //"wss://renault.gerrits.xyz"
import { cryptoWaitReady, } from '@polkadot/util-crypto';
import { parachainApi } from './common.js';
const myApp = () => __awaiter(void 0, void 0, void 0, function* () {
    yield cryptoWaitReady();
    let total_pending_tx = 0;
    const parachainApiInstRenault = yield parachainApi(renault_url);
    parachainApiInstRenault.rpc.author.pendingExtrinsics().then((list) => {
        total_pending_tx += list.length;
    }).then(() => {
        console.log(total_pending_tx);
        process.exit(0);
    }).catch((err) => {
        console.log(err);
    });
});
myApp();
