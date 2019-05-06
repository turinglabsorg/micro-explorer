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
function resync(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.set('indexreset', true);
        res.json({
            data: 'INDEX RESETTED, STARTING FROM BLOCK 0',
            status: 200
        });
    });
}
exports.resync = resync;
;
function gettransaction(req, res) {
    var wallet = new Crypto.Wallet;
    var txid = req.params.txid;
    wallet.request('getrawtransaction', [txid]).then(function (rawtransaction) {
        wallet.request('decoderawransaction', [txid]).then(function (rawtransaction) {
            wallet.analyzeTransaction(rawtransaction['result']).then(response => {
                res.json({
                    data: response,
                    status: 200
                });
            });
        });
    });
}
exports.gettransaction = gettransaction;
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
        var list = yield getmembers(address + '_tx');
        var transactions = [];
        for (var index in list) {
            var tx = JSON.parse(list[index]);
            transactions.push(tx);
        }
        transactions.sort((a, b) => Number(b.time) - Number(a.time));
        res.json({
            data: transactions,
            status: 200
        });
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
        var balance = 0;
        var list = yield getmembers(address + '_tx');
        for (var index in list) {
            var tx = JSON.parse(list[index]);
            balance += tx.value;
        }
        res.json({
            balance: balance,
            status: 200
        });
    });
}
exports.balance = balance;
;
function stats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var address = req.params.address;
        if (address.length > 0) {
            var received = 0;
            var sent = 0;
            var balance = 0;
            var stats = {
                rewards: {
                    count: 0,
                    amount: 0,
                    stats: {},
                    txns: []
                },
                stake: {
                    count: 0,
                    amount: 0,
                    stats: {},
                    txns: []
                }
            };
            var list = yield getmembers(address + '_tx');
            var transactions = [];
            for (var index in list) {
                var unordered = JSON.parse(list[index]);
                transactions.push(unordered);
            }
            transactions.sort((a, b) => Number(a.time) - Number(b.time));
            for (var index in transactions) {
                var tx = transactions[index];
                if (tx.value > 0) {
                    received += tx.value;
                }
                else {
                    sent += tx.value;
                }
                balance += tx.value;
                var datetime = new Date(tx.time * 1000);
                var date = datetime.getFullYear() + '-' + ('0' + (datetime.getMonth() + 1)).slice(-2) + '-' + ('0' + datetime.getDate()).slice(-2);
                if (tx.type === 'STAKE') {
                    stats.stake.count++;
                    stats.stake.amount += tx.value;
                    stats.stake.txns.push(tx);
                    if (stats.stake.stats[date] === undefined) {
                        stats.stake.stats[date] = 0;
                    }
                    stats.stake.stats[date] += tx.value;
                }
                if (tx.type === 'REWARD') {
                    stats.rewards.count++;
                    stats.rewards.amount += tx.value;
                    stats.rewards.txns.push(tx);
                    if (stats.rewards.stats[date] === undefined) {
                        stats.rewards.stats[date] = 0;
                    }
                    stats.rewards.stats[date] += tx.value;
                }
            }
            sent = sent * -1;
            res.json({
                balance: balance,
                received: received,
                sent: sent,
                rewards: stats.rewards,
                stake: stats.stake,
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