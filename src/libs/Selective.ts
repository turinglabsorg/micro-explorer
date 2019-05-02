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
                
                //FIND STORED HASHES
                var index = db.collection("indexes")

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
                    task.process()
                },60000)
            }
        })
    }

    public async process(){
        var db = new Engine.Db('./db', {})
        var tocheck = blocks.length
        console.log('PROCESSING ' + tocheck + ' BLOCKS')
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
                       analyze.push(block)
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
            for(var address in block['balances']){
                if(addresses.indexOf(address) !== -1){
                    for(var txid in block['balances'][address]){
                        var tx = block['balances'][address][txid]
                        var stats = db.collection("stats")
                        stats.findOne({address: address, txid: txid}, function(err, item) {
                            if(item === null){
                                stats.insert({
                                    address: address,
                                    txid: txid,
                                    type: tx.type,
                                    value: tx.value,
                                    blockhash: block['hash'],
                                    blockheight: block['height'],
                                    time: block['time']
                                })
                            }
                        })
                        var indexes = db.collection("indexes")
                        indexes.insert({address: address, block: block['hash']})
                    }
                }else{
                    var indexes = db.collection("indexes")
                    indexes.insert({address: address, block: block['hash']})
                }
            }
            var end = Date.now()
            var elapsed = (end - start) / 1000
            analyze.shift()
            console.log('\x1b[33m%s\x1b[0m', 'FINISHED IN '+ elapsed +'s. BLOCKS TO COMPLETE: ' + analyze.length)
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

  }

}

export = Selective;