"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("../libs/Crypto");
var Engine = require('tingodb')();
function info(req, res) {
    res.json({ status: "ONLINE" });
}
exports.info = info;
;
function transactions(req, res) {
    var address = req.params.address;
    if (address.length > 0) {
        var db = new Engine.Db('./db', {});
        var collection = db.collection("stats");
        collection.find({ address: address }, { sort: { time: -1 } }).toArray(function (err, items) {
            res.json({
                data: items,
                status: 200
            });
        });
    }
    else {
        res.json({
            data: 'Missing parameter: address',
            status: 422
        });
    }
}
exports.transactions = transactions;
;
function balance(req, res) {
    var address = req.params.address;
    if (address.length > 0) {
        var wallet = new Crypto.Wallet;
        wallet.request('listunspent', [0, 99999999999999, [address]]).then(response => {
            var balance = 0;
            var unspent = response['result'];
            for (var i = 0; i < unspent.length; i++) {
                balance += unspent[i].amount;
            }
            res.json({
                data: balance,
                status: 200
            });
        });
    }
    else {
        res.json({
            data: 'Missing parameter: address',
            status: 422
        });
    }
}
exports.balance = balance;
;
function stats(req, res) {
    var address = req.params.address;
    if (address.length > 0) {
        var stats = {};
        res.json({
            data: stats,
            status: 200
        });
    }
    else {
        res.json({
            data: 'Missing parameter: address',
            status: 422
        });
    }
}
exports.stats = stats;
;
//# sourceMappingURL=Explorer.js.map