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
const get = promisify(db.get).bind(db);
function getinfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var wallet = new Crypto.Wallet;
        var lastindexed = yield get("fullindex_" + process.env.COIN);
        var watchlist = yield getmembers("watchlist");
        wallet.request('getinfo').then(function (info) {
            info['result']['indexed'] = parseInt(lastindexed);
            var toindex = parseInt(info['result']['blocks']) - parseInt(lastindexed);
            info['result']['toindex'] = toindex;
            info['result']['watchlist'] = watchlist;
            res.json(info['result']);
        });
    });
}
exports.getinfo = getinfo;
;
function getmasternodelist(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var wallet = new Crypto.Wallet;
        wallet.request('masternode', ['count']).then(function (count) {
            wallet.request('masternode', ['list']).then(function (list) {
                wallet.request('masternode', ['current']).then(function (current) {
                    var response = {
                        count: count['result'],
                        current: current['result'],
                        list: list['result']
                    };
                    res.json(response);
                });
            });
        });
    });
}
exports.getmasternodelist = getmasternodelist;
;
//# sourceMappingURL=Wallet.js.map