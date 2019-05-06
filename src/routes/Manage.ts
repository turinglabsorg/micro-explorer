import express = require("express")
import * as Crypto from '../libs/Crypto'
import * as Utilities from '../libs/Utilities'
var redis = require("redis")
var db = redis.createClient()
const {promisify} = require('util')
const getmembers = promisify(db.smembers).bind(db)

db.on("error", function (err) {
    console.log("Error " + err);
});


export function watch(req: express.Request, res: express.Response) {
    var address = req.params.address
            
    var wallet = new Crypto.Wallet
    wallet.request('importaddress',[address, address, true]).then(function(response){
        db.sadd("watchlist", address);
        res.json({
            data: 'WATCHING',
            status: 200
        })
    })
};

export function unwatch(req: express.Request, res: express.Response) {
    var address = req.params.address
    db.srem('watchlist',address);
    res.json({
        data: 'UNWATCHED',
        status: 200
    })
       
};

export function watchlist(req: express.Request, res: express.Response) {
    
    db.smembers('watchlist', function(err, watchlist) {
        res.json({
            data: watchlist,
            status: 200
        })
    })

};