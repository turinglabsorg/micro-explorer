"use strict";
var Engine = require('tingodb')()
import express = require("express")
import * as Crypto from './Crypto'

var blocks = []
var analyze = []
var addresses = []

module Selective {

  export class Sync {
    
    public init() {
        var wallet = new Crypto.Wallet
        var db = new Engine.Db('./db', {})
        var watchlist = db.collection("addresses")
        
        watchlist.find({blockchain: process.env.COIN}).toArray(function(err, items) {
            //PUTTING ALL ADDRESSES TOGETHER
            if(items.length > 0){
                items.forEach(function(watch){
                    if(addresses.indexOf(watch.address) === -1){
                        addresses.push(watch.address)
                    }
                })
                
                //FIND ONLY BLOCKS WITH INTERESTING TRANSACTIONS
                wallet.request('listtransactions',["", 99999999999, 0, true]).then(result => {
                    var transactions = result['result']
                    transactions.forEach(function(tx){
                        if(addresses.indexOf(tx.address) !== -1){
                            if(blocks.indexOf(tx.blockhash) === -1){
                                blocks.push(tx.blockhash)
                            }
                        }
                    })
                    var task = new Selective.Sync
                    task.process()
                })
            }else{
                console.log('NO ADDRESS TO WATCH, RETRY IN 60s')
                setTimeout(function(){
                    var task = new Selective.Sync
                    task.init()
                },60000)
            }
        })
    }

    public async process(){
        var db = new Engine.Db('./db', {})
        var tocheck = blocks.length
        console.log('FOUND ' + tocheck + ' BLOCKS WITH INVOLVED TRANSACTIONS')
        var checked = 0
        for(var ain in addresses){
            var address = addresses[ain]
            console.log('PROCESSING ADDRESS ' + address)
            var indexes = db.collection("indexes")
            indexes.find().toArray(function(err, items) {
                var scanned = []
                items.forEach(scan => {
                    scanned.push(scan['block'] + '/' + scan['address'])
                })
                blocks.forEach(block => {
                    checked++
                    if(scanned.indexOf(block+'/'+address) === -1){
                        if(analyze.indexOf(block) === -1){
                            analyze.push(block)
                        }
                    }
                    if(checked === tocheck){
                        console.log('NEED TO ANALYZE ' + analyze.length + ' BLOCKS')
                        var task = new Selective.Sync
                        task.analyze()
                    }
                })
            })
        }
    }

    public async analyze(){
        if(analyze[0]){
            var start = Date.now()
            console.log('\x1b[32m%s\x1b[0m', 'ANALYZING BLOCK ' + analyze[0])
            var db = new Engine.Db('./db', {})
            var wallet = new Crypto.Wallet
            var block = await wallet.analyzeBlock(analyze[0])
            for(var txid in block['analysis']){
                for(var address in block['analysis'][txid]['balances']){
                    if(addresses.indexOf(address) !== -1){
                        var tx = block['analysis'][txid]['balances'][address]
                        var movements = block['analysis'][txid]['movements']
                        var task = new Selective.Sync
                        console.log('STORING '+ tx.type +' OF '+ tx.value + ' ' + process.env.COIN + ' FOR ADDRESS ' + address)
                        await task.store(address, block, txid, tx, movements)
                    }
                }
            }
            var end = Date.now()
            var elapsed = (end - start) / 1000
            analyze.shift()
            console.log('\x1b[33m%s\x1b[0m', 'FINISHED IN '+ elapsed +'s. ' + analyze.length + ' BLOCKS UNTIL END')
            var task = new Selective.Sync
            task.analyze()
        }else{
            console.log('\x1b[41m%s\x1b[0m', 'ANALYZED EVERYTHING REBOOTING PROCESS IN 30 SECONDS')
            setTimeout(function(){
                var task = new Selective.Sync
                task.init()
            },30000)
        }
    }

    private async store(address, block, txid, tx, movements){
        return new Promise (response => {
            var db = new Engine.Db('./db', {})
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
            indexes.insert({address: address, block: block['hash']})
            response('DONE')
        })
    }
  }

}

export = Selective;