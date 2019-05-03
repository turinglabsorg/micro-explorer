"use strict";
var Engine = require('tingodb')()
import express = require("express")
import * as Crypto from './Crypto'

var blocks = 0
var analyze = 0
var analyzed = 0
var db = new Engine.Db('./db', {})

module Full {

  export class Sync {
    
    public init() {
        var wallet = new Crypto.Wallet
        wallet.request('getinfo').then(info => {
            blocks = info['result'].blocks
            var task = new Full.Sync
            task.process()
        })
    }

    public async process(){
        if(analyzed === 0){
            console.log('FOUND ' + blocks + ' BLOCKS IN THE BLOCKCHAIN')
            var indexes = db.collection("indexes")
            indexes.find().sort({block: -1}).limit(1).toArray(function(err, last) {
                if(last !== null && last !== undefined){
                    analyze = parseInt(last[0]['block']) + 1
                }else{
                    analyze = 1
                }
                var task = new Full.Sync
                task.analyze()
            })
        }else{
            analyze = analyzed + 1
            var task = new Full.Sync
            task.analyze()
        }
    }

    public async analyze(){
        if(analyze > 0){
            var start = Date.now()
            console.log('\x1b[32m%s\x1b[0m', 'ANALYZING BLOCK ' + analyze)
            var wallet = new Crypto.Wallet
            var blockhash = await wallet.request('getblockhash',[analyze])
            var block = await wallet.analyzeBlock(blockhash['result'])
            for(var txid in block['analysis']){
                for(var address in block['analysis'][txid]['balances']){
                    var tx = block['analysis'][txid]['balances'][address]
                    var movements = block['analysis'][txid]['movements']
                    var task = new Full.Sync
                    console.log('STORING '+ tx.type +' OF '+ tx.value + ' ' + process.env.COIN + ' FOR ADDRESS ' + address)
                    await task.store(address, block, txid, tx, movements)
                }
            }
            var end = Date.now()
            var elapsed = (end - start) / 1000
            var remains = blocks - analyze
            var estimated = (elapsed * remains) / 60 / 60;
            console.log('\x1b[33m%s\x1b[0m', 'FINISHED IN '+ elapsed +'s. ' + remains + ' BLOCKS UNTIL END. ' + estimated.toFixed(2) + 'h ESTIMATED.')
            setTimeout(function(){
                var task = new Full.Sync
                task.process()
            },100)
        }else{
            console.log('\x1b[41m%s\x1b[0m', 'ANALYZED EVERYTHING REBOOTING PROCESS IN 30 SECONDS')
            setTimeout(function(){
                var task = new Full.Sync
                task.init()
            },30000)
        }
    }

    private async store(address, block, txid, tx, movements){
        return new Promise (response => {
            var stats = db.collection("stats")
            stats.update(
                {
                    address: address, 
                    txid: txid
                },
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
                },
                {
                    upsert: true
                }
            )
            var indexes = db.collection("indexes")
            indexes.insert({block: block['height']})
            analyzed = block['height']
            response('DONE')
        })
    }
  }

}

export = Full;