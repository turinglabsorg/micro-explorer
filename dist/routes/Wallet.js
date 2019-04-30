"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("../libs/Crypto");
const Utilities = require("../libs/Utilities");
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
            wallet.request('getblockhash', [parseInt(body['block'])]).then(function (blockhash) {
                wallet.request('getblock', [blockhash['result']]).then(function (block) {
                    res.json({
                        data: block['result'],
                        status: 200
                    });
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
//# sourceMappingURL=Wallet.js.map