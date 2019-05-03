import express = require("express")
import * as Utilities from '../libs/Utilities'
import * as Crypto from '../libs/Crypto'
var Engine = require('tingodb')()

export function info(req: express.Request, res: express.Response) {
    res.json({status: "ONLINE"})
};

export function transactions(req: express.Request, res: express.Response) {
    var address = req.params.address
    var db = new Engine.Db('./db', {})
    var collection = db.collection("stats")

    collection.find({address: address}, {sort: {time: -1}}).toArray(function(err, items) {
        res.json({
            data: items,
            status: 200
        })
    })
};

export function balance(req: express.Request, res: express.Response) {
    var address = req.params.address
    var wallet = new Crypto.Wallet
    wallet.request('listunspent',[0,99999999999999,[address]]).then(response => {
        var balance = 0
        var unspent = response['result']
        for(var i=0; i < unspent.length; i++){
            balance += unspent[i].amount
        }
        res.json({
            data: balance,
            status: 200
        })
    })
};