import express = require("express")
import * as Scrypta from '../libs/Crypto'

export function getinfo(req: express.Request, res: express.Response) {
    var wallet = new Scrypta.Wallet;
    wallet.request('getinfo').then(function(info){
        res.json(info['result'])
    })
};

export function getbalance(req: express.Request, res: express.Response) {
    var wallet = new Scrypta.Wallet;
    wallet.request('getbalance').then(function(info){
        res.json({
            data: info['result'],
            status: 200
        })
    })
};