import express = require("express")
import * as Crypto from '../libs/Crypto'
import * as Utilities from '../libs/Utilities'
var redis = require("redis")
var db = redis.createClient()
const {promisify} = require('util')
const getmembers = promisify(db.smembers).bind(db)
const get = promisify(db.get).bind(db)

export async function getinfo(req: express.Request, res: express.Response) {
    var wallet = new Crypto.Wallet;
    var lastindexed = await get("fullindex_" + process.env.COIN)
    var watchlist = await getmembers("watchlist")

    wallet.request('getinfo').then(function(info){
        info['result']['indexed'] = parseInt(lastindexed)
        var toindex = parseInt(info['result']['blocks']) - parseInt(lastindexed)
        info['result']['toindex'] = toindex
        info['result']['watchlist'] = watchlist
        res.json(info['result'])
    })
};

export async function getmasternodelist(req: express.Request, res: express.Response) {
    var wallet = new Crypto.Wallet;

    wallet.request('masternode',['count']).then(function(count){
        wallet.request('masternode',['list']).then(function(list){
            wallet.request('masternode',['current']).then(function(current){
                var response = {
                    count: count['result'],
                    current: current['result'],
                    list: list['result']
                }
                res.json(response)
            })
        })
    })
};