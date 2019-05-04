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

//
export async function sync(req: express.Request, res: express.Response) {
    var address = req.params.address
    console.log('SYNCING ADDRESS ' + address)
    var watchlist = await getmembers('watchlist')
    if(watchlist.indexOf(address) === -1){
        console.log('ADDRESS NOT WATCHED NOW, INCLUDING IN DAEMON')
        var wallet = new Crypto.Wallet
        await wallet.request('importaddress',[address, address, true])
        db.sadd("watchlist", address);
    }
    var wallet = new Crypto.Wallet
    var result = await wallet.request('listtransactions',[address, 999999999, 0, true])
    var transactions = result['result']
    var indexed = await getmembers(address + '_indexes')
    
    console.log(indexed.length + ' BLOCKS INDEXED YET')
    var blocks = []
    var txcount = 0
    
    transactions.forEach(function(tx){
        if(tx.address == address){
            txcount ++
            if(indexed.indexOf(tx.blockhash) === -1){
                blocks.push(tx.blockhash)
                indexed.push(tx.blockhash)
            }
        }
    })
    console.log(txcount + ' TOTAL TRANSACTIONS FOUND.')
    console.log(blocks.length + ' BLOCKS TO INDEX')

    for(var index in blocks){
        var blockhash = blocks[index]
        var start = Date.now()
        console.log('\x1b[32m%s\x1b[0m', 'ANALYZING BLOCK ' + blockhash)
        var block = await wallet.analyzeBlock(blockhash)
        for(var txid in block['analysis']){
            for(var addresstx in block['analysis'][txid]['balances']){
                if(addresstx === address){
                    var tx = block['analysis'][txid]['balances'][address]
                    var movements = block['analysis'][txid]['movements']
                    console.log('STORING '+ tx.type +' OF '+ tx.value + ' ' + process.env.COIN + ' FOR ADDRESS ' + address)
                    await db.sadd(address + '_tx', JSON.stringify(
                        {
                            address: address,
                            txid: txid,
                            type: tx.type,
                            from: movements.from,
                            to: movements.to,
                            value: tx.value,
                            blockhash: block['hash'],
                            blockheight: block['height'],
                            time: block['time']
                        }
                    ))
                    await db.sadd(address + '_indexes', block['hash'])
                }
            }
        }
        var end = Date.now()
        var elapsed = (end - start) / 1000
        var remains = blocks.length - parseInt(index) - 1
        var estimated = (elapsed * remains) / 60 / 60;
        console.log('\x1b[33m%s\x1b[0m', 'FINISHED IN '+ elapsed +'s. ' + remains + ' BLOCKS UNTIL END. ' + estimated.toFixed(2) + 'h ESTIMATED.')
    }
    console.log('SYNC DONE')
    res.json({
        data: 'SYNC DONE',
        status: 200
    })
};


