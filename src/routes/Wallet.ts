import express = require("express")
import * as Crypto from '../libs/Crypto'
import * as Utilities from '../libs/Utilities'
var Engine = require('tingodb')()

export function getinfo(req: express.Request, res: express.Response) {
    var wallet = new Crypto.Wallet;
    wallet.request('getinfo').then(function(info){
        res.json(info['result'])
    })
};

export function getblock(req: express.Request, res: express.Response) {
    var wallet = new Crypto.Wallet;
    var utilities = new Utilities.Parser
    utilities.body(req).then(function(body){
        if(body['block']){
            wallet.analyzeBlock(body['block']).then(response => {
                res.json({
                    data: response,
                    status: 200
                })
            })
        }else{
            res.json({
                data: 'Missing parameter: block',
                status: 422
            })
        }
    })
};