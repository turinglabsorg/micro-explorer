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
function unspent(req, res) {
    var address = req.params.address;
    if (address.length > 0) {
        var wallet = new Crypto.Wallet;
        wallet.request('listunspent', [0, 99999999999999, [address]]).then(response => {
            var unspent = response['result'];
            res.json({
                data: unspent,
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
exports.unspent = unspent;
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
    return __awaiter(this, void 0, void 0, function* () {
        var address = req.params.address;
        if (address.length > 0) {
            var stats = {};
            var wallet = new Crypto.Wallet;
            var response = yield wallet.request('listunspent', [0, 99999999999999, [address]]);
            var balance = 0;
            var unspent = response['result'];
            for (var i = 0; i < unspent.length; i++) {
                balance += unspent[i].amount;
            }
            //TODO
            res.json({
                rewards: {},
                stake: {},
                balance: balance,
                status: 200
            });
        }
        else {
            res.json({
                data: 'Missing parameter: address',
                status: 422
            });
        }
    });
}
exports.stats = stats;
;
//# sourceMappingURL=Explorer.js.map