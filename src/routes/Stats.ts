import express = require("express")
import * as Crypto from '../libs/Crypto'
import * as Utilities from '../libs/Utilities'
var Engine = require('tingodb')()

export function watch(req: express.Request, res: express.Response) {
    var utilities = new Utilities.Parser
    utilities.body(req).then(function(body){
        if(body['address']){
            var db = new Engine.Db('./db', {})
            var collection = db.collection("addresses")
            var address = body['address']
            
            var wallet = new Crypto.Wallet
            wallet.request('importaddress',[address, "", true]).then(function(response){
                collection.findOne({address: address}, function(err, item) {
                    if(item === null){
                        collection.insert({blockchain: process.env.COIN, address: address})
                    }
                })
            })

            res.json({
                data: 'WATCHING',
                status: 200
            })

        }else{
            res.json({
                data: 'Missing parameter: address',
                status: 422
            })
        }
    })
};

export function unwatch(req: express.Request, res: express.Response) {
    var utilities = new Utilities.Parser
    utilities.body(req).then(function(body){
        if(body['address']){
            var db = new Engine.Db('./db', {})
            var collection = db.collection("addresses")
            var address = body['address']

            collection.findOne({address: address}, function(err, item) {
                if(item !== null){
                    collection.remove({
                        _id: item._id
                    })
                    res.json({
                        data: 'UNWATCHED',
                        status: 200
                    })
                }else{
                    res.json({
                        data: 'ADDRESS NOT FOUND',
                        status: 404
                    })
                }
            })

        }else{
            res.json({
                data: 'Missing parameter: address',
                status: 422
            })
        }
    })
};

export function watchlist(req: express.Request, res: express.Response) {
    var address = req.params.address
    var db = new Engine.Db('./db', {})
    var collection = db.collection("addresses")

    collection.find({blockchain: process.env.COIN}).toArray(function(err, items) {
        res.json({
            data: items,
            status: 200
        })
    })
};

export function address(req: express.Request, res: express.Response) {
    var address = req.params.address
    var db = new Engine.Db('./db', {})
    var collection = db.collection("stats")

    collection.find({address: address}).toArray(function(err, items) {
        res.json({
            data: items,
            status: 200
        })
    })
};
