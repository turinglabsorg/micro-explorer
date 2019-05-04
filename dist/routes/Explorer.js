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
var redis = require("redis");
var db = redis.createClient();
const { promisify } = require('util');
const getmembers = promisify(db.smembers).bind(db);
function info(req, res) {
    res.json({ status: "ONLINE" });
}
exports.info = info;
;
function getblock(req, res) {
    var wallet = new Crypto.Wallet;
    var block = req.params.block;
    wallet.request('getblockhash', [parseInt(block)]).then(function (blockhash) {
        wallet.analyzeBlock(blockhash['result']).then(response => {
            res.json({
                data: response,
                status: 200
            });
        });
    });
}
exports.getblock = getblock;
;
function transactions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var address = req.params.address;
        if (address.length > 0) {
            var list = yield getmembers(address + '_tx');
            var transactions = [];
            for (var index in list) {
                var tx = JSON.parse(list[index]);
                transactions.push(tx);
            }
            transactions.sort((a, b) => Number(b.time) - Number(a.time));
        }
        else {
            res.json({
                data: 'Missing parameter: address',
                status: 422
            });
        }
    });
}
exports.transactions = transactions;
;
function unspent(req, res) {
    var address = req.params.address;
    if (address.length > 0) {
        var wallet = new Crypto.Wallet;
        var balance = 0;
        wallet.request('listunspent', [0, 9999999, [address]]).then(response => {
            var unspent = response['result'];
            for (var i = 0; i < unspent.length; i++) {
                balance += unspent[i].amount;
            }
            res.json({
                balance: balance,
                unspent: unspent,
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
    return __awaiter(this, void 0, void 0, function* () {
        var address = req.params.address;
        var wallet = new Crypto.Wallet;
        var balance = 0;
        wallet.request('listunspent', [0, 9999999, [address]]).then(response => {
            var unspent = response['result'];
            for (var i = 0; i < unspent.length; i++) {
                balance += unspent[i].amount;
            }
            res.json({
                balance: balance,
                status: 200
            });
        });
    });
}
exports.balance = balance;
;
function stats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var address = req.params.address;
        if (address.length > 0) {
            var stats = {};
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