"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("../libs/Crypto");
const Utilities = require("../libs/Utilities");
var Engine = require('tingodb')();
function getinfo(req, res) {
    var wallet = new Crypto.Wallet;
    wallet.request('getinfo').then(function (info) {
        res.json(info['result']);
    });
}
exports.getinfo = getinfo;
;
function getblock(req, res) {
    var wallet = new Crypto.Wallet;
    var utilities = new Utilities.Parser;
    utilities.body(req).then(function (body) {
        if (body['block']) {
            wallet.analyzeBlock(body['block']).then(response => {
                res.json({
                    data: response,
                    status: 200
                });
            });
        }
        else {
            res.json({
                data: 'Missing parameter: block',
                status: 422
            });
        }
    });
}
exports.getblock = getblock;
;
function watch(req, res) {
    var utilities = new Utilities.Parser;
    utilities.body(req).then(function (body) {
        if (body['address']) {
            var db = new Engine.Db('./db', {});
            var collection = db.collection("addresses");
            var address = body['address'];
            collection.findOne({ address: address }, function (err, item) {
                if (item === null) {
                    collection.insert({ blockchain: process.env.COIN, address: address });
                }
            });
            res.json({
                data: 'WATCHING',
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
exports.watch = watch;
;
function unwatch(req, res) {
    var utilities = new Utilities.Parser;
    utilities.body(req).then(function (body) {
        if (body['address']) {
            var db = new Engine.Db('./db', {});
            var collection = db.collection("addresses");
            var address = body['address'];
            collection.findOne({ address: address }, function (err, item) {
                if (item !== null) {
                    collection.remove({
                        _id: item._id
                    });
                    res.json({
                        data: 'UNWATCHED',
                        status: 200
                    });
                }
                else {
                    res.json({
                        data: 'ADDRESS NOT FOUND',
                        status: 404
                    });
                }
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
exports.unwatch = unwatch;
;
//# sourceMappingURL=Wallet.js.map