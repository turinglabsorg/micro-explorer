import express = require("express")
import * as Utilities from '../libs/Utilities'
import * as Crypto from '../libs/Crypto'
var Engine = require('tingodb')()

export function info(req: express.Request, res: express.Response) {
    res.json({status: "ONLINE"})
};

export function transactions(req: express.Request, res: express.Response) {
    var address = req.params.address
    if(address.length > 0){
        var db = new Engine.Db('./db', {})
        var collection = db.collection("stats")
        collection.find({address: address}, {sort: {time: -1}}).toArray(function(err, items) {
            res.json({
                data: items,
                status: 200
            })
        })
    }else{
        res.json({
            data: 'Missing parameter: address',
            status: 422
        })
    }
};

export function unspent(req: express.Request, res: express.Response) {
    var address = req.params.address
    if(address.length > 0){
        var wallet = new Crypto.Wallet
        wallet.request('listunspent',[0,99999999999999,[address]]).then(response => {
            var unspent = response['result']
            res.json({
                data: unspent,
                status: 200
            })
        })
    }else{
        res.json({
            data: 'Missing parameter: address',
            status: 422
        })
    }
};

export function balance(req: express.Request, res: express.Response) {
    var address = req.params.address
    if(address.length > 0){
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
    }else{
        res.json({
            data: 'Missing parameter: address',
            status: 422
        })
    }
};

export async function stats(req: express.Request, res: express.Response) {
    var address = req.params.address
    if(address.length > 0){
        var stats = {}
        
        var wallet = new Crypto.Wallet
        var response = await wallet.request('listunspent',[0,99999999999999,[address]])
        var balance = 0
        var unspent = response['result']
        for(var i=0; i < unspent.length; i++){
            balance += unspent[i].amount
        }
        //TODO
        res.json({
            rewards: {},
            stake: {},
            balance: balance,
            status: 200
        })
    }else{
        res.json({
            data: 'Missing parameter: address',
            status: 422
        })
    }
};
