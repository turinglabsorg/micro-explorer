import express = require("express")
import * as Utilities from '../libs/Utilities'
import * as Crypto from '../libs/Crypto'
var redis = require("redis")
var db = redis.createClient()
const {promisify} = require('util')
const getmembers = promisify(db.smembers).bind(db)

export function info(req: express.Request, res: express.Response) {
    res.json({status: "ONLINE"})
};

export async function transactions(req: express.Request, res: express.Response) {
    var address = req.params.address
    if(address.length > 0){
        var list = await getmembers(address +'_tx')
        var transactions = []
        for(var index in list){
            var tx = JSON.parse(list[index])
            transactions.push(tx)
        }
        res.json({
            data: transactions,
            status: 200
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
        var balance = 0
        wallet.request('listunspent',[0,9999999,[address]]).then(response => {
            var unspent = response['result']
            for(var i = 0; i < unspent.length; i++){
                balance += unspent[i].amount
            }
            res.json({
                balance: balance,
                unspent: unspent,
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

export async function balance(req: express.Request, res: express.Response) {
    var address = req.params.address
    var list = await getmembers(address +'_tx')
    var balance = 0
    for(var index in list){
        var tx = JSON.parse(list[index])
        balance += tx.value
    }
    res.json({data: balance, status: 200})
};

export async function stats(req: express.Request, res: express.Response) {
    var address = req.params.address
    if(address.length > 0){
        var stats = {}
        
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
