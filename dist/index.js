"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const Crypto = require("./libs/Crypto");
require('dotenv').config();
const port = process.env.PORT || 4001;
App_1.default.engine('html', require('ejs').renderFile);
App_1.default.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    var wallet = new Crypto.Wallet;
    wallet.request('getinfo').then(function (info) {
        if (info !== undefined) {
            console.log(process.env.COIN + ' wallet successfully connected.');
        }
        else {
            console.log('Can\'t communicate with wallet, please check RPC.');
        }
    });
    return console.log(`MircoExplorer listening at port ${port}`);
});
//# sourceMappingURL=index.js.map