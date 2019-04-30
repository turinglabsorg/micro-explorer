"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("../libs/Crypto");
function getinfo(req, res) {
    var wallet = new Crypto.Wallet;
    wallet.request('getinfo').then(function (info) {
        res.json(info['result']);
    });
}
exports.getinfo = getinfo;
;
function getbalance(req, res) {
    var wallet = new Crypto.Wallet;
    wallet.request('getbalance').then(function (info) {
        res.json({
            data: info['result'],
            status: 200
        });
    });
}
exports.getbalance = getbalance;
;
//# sourceMappingURL=Wallet.js.map