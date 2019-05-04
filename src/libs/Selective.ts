"use strict";
import express = require("express")
import * as Crypto from './Crypto'
var redis = require("redis")
var db = redis.createClient()
const {promisify} = require('util')
const getmembers = promisify(db.smembers).bind(db)

var blocks = []
var analyze = []
var addresses = []

module Selective {

  export class Sync {
    
    public async init() {
        var wallet = new Crypto.Wallet

        var addresses = await getmembers("watchlist")
        //PUTTING ALL ADDRESSES TOGETHER
        if(addresses.length > 0){
            console.log(addresses.length + ' DIFFERENT ADDRESSES FOUND.')
            //FIND ONLY BLOCKS WITH INTERESTING TRANSACTIONS
            var result = await wallet.request('listtransactions',["", 999999999, 0, true])
            var transactions = result['result']
            var indexes = {}
            for(var i = 0; i < addresses.length; i++){
                var indexed = await getmembers(addresses[i] + '_indexes')
                indexes[addresses[i]] = indexed
            }
            transactions.forEach(function(tx){
                if(addresses.indexOf(tx.address) !== -1){
                    if(indexes[tx.address].indexOf(tx.blockhash) === -1){
                        blocks.push(tx.blockhash)
                    }
                }
            })

            var task = new Selective.Sync
            task.process()
        }else{
            console.log('NO ADDRESS TO WATCH, RETRY IN 60s')
            setTimeout(function(){
                var task = new Selective.Sync
                task.init()
            },60000)
        }
    }

    public async process(){
        var tocheck = blocks.length
        console.log('FOUND ' + tocheck + ' BLOCKS WITH INVOLVED TRANSACTIONS')
        for(var ain in addresses){
            var address = addresses[ain]
            var indexes = await getmembers(address + "_indexes")
            console.log('LOOKING AT INDEXED BLOCKS FOR ' + address + ', ' + indexes.length + ' FOUND')
            for(var block in blocks){
                if(indexes.indexOf(blocks[block]) === -1){
                    analyze.push(blocks[block])
                }
            }
        }
        var task = new Selective.Sync
        task.analyze()
    }

    public async analyze(){
        if(analyze[0]){
            var start = Date.now()
            console.log('\x1b[32m%s\x1b[0m', 'ANALYZING BLOCK ' + analyze[0])
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
            var remains = analyze.length
            var estimated = (elapsed * remains) / 60 / 60;
            analyze.shift()
            console.log('\x1b[33m%s\x1b[0m', 'FINISHED IN '+ elapsed +'s. ' + remains + ' BLOCKS UNTIL END. ' + estimated.toFixed(2) + 'h ESTIMATED.')   
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
            db.sadd(address + '_tx', JSON.stringify(
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
            ), function(err, callback){
                db.sadd(address + '_indexes', block['hash'],function(err, callback){
                    response('DONE')
                })
            })
        })
    }
  }

}

export = Selective;