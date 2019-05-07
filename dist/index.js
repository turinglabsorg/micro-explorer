"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const Crypto = require("./libs/Crypto");
const Daemon = require("./libs/Daemon");
let { nextAvailable } = require('node-port-check');
require('dotenv').config();
const microexplorer = () => __awaiter(this, void 0, void 0, function* () {
    let port = yield nextAvailable(3001, '0.0.0.0');
    App_1.default.engine('html', require('ejs').renderFile);
    App_1.default.listen(port, (err) => {
        if (err) {
            return console.log(err);
        }
        var wallet = new Crypto.Wallet;
        wallet.request('getinfo').then(function (info) {
            if (info !== undefined) {
                console.log(process.env.COIN + ' wallet successfully connected.');
                var task;
                task = new Daemon.Sync;
                task.init();
            }
            else {
                console.log('Can\'t communicate with wallet, please check RPC.');
            }
        });
        return console.log(`MircoExplorer listening at port ${port}`);
    });
});
microexplorer();
//# sourceMappingURL=index.js.map