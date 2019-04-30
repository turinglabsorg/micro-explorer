"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let request = require("request");
var Engine = require('tingodb')();
var Crypto;
(function (Crypto) {
    class Wallet {
        request(method, params = []) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(response => {
                    var rpcuser = process.env.RPCUSER;
                    var rpcpassword = process.env.RPCPASSWORD;
                    var rpcendpoint = 'http://' + process.env.RPCADDRESS + ':' + process.env.RPCPORT;
                    if (process.env.DEBUG === "full") {
                        console.log('Connecting to ' + rpcendpoint + ' WITH ' + rpcuser + '/' + rpcpassword);
                    }
                    let req = {
                        url: rpcendpoint,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic ' + Buffer.from(rpcuser + ":" + rpcpassword).toString("base64")
                        },
                        body: JSON.stringify({
                            id: Math.floor((Math.random() * 100000) + 1),
                            params: params,
                            method: method
                        })
                    };
                    request(req, function (err, res, body) {
                        try {
                            if (process.env.DEBUG === "full") {
                                console.log(body);
                            }
                            response(JSON.parse(body));
                        }
                        catch (err) {
                            response(body);
                        }
                    });
                });
            });
        }
    }
    Crypto.Wallet = Wallet;
})(Crypto || (Crypto = {}));
module.exports = Crypto;
//# sourceMappingURL=Crypto.js.map