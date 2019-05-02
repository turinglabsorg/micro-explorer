"use strict";
import * as Utilities from './Utilities'
let request = require("request")
var Engine = require('tingodb')()

module Crypto {

  export class Wallet {

    public hex2a(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    public async request(method, params = []) {
        return new Promise(response => {
            var rpcuser = process.env.RPCUSER
            var rpcpassword = process.env.RPCPASSWORD
            var rpcendpoint = 'http://'+ process.env.RPCADDRESS +':' + process.env.RPCPORT
            if(process.env.DEBUG === "full"){
                console.log('Connecting to ' + rpcendpoint + ' WITH ' +rpcuser+'/'+rpcpassword)
            }
            let req = {
                url: rpcendpoint,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(rpcuser + ":" + rpcpassword).toString("base64")
                },
                body: JSON.stringify({
                    id: Math.floor((Math.random() * 100000) + 1),
                    params: params,
                    method: method
                })
            };
            request(req, function (err, res, body) {
                try {
                    if(process.env.DEBUG === "full"){
                        console.log(body)
                    }
                    response(JSON.parse(body))
                } catch (err) {
                    response(body)
                }
            });
        })
    }

    public async analyzeBlock (block) {
        return new Promise (response => {
            var wallet = new Crypto.Wallet
            wallet.request('getblockhash', [parseInt(block)]).then(function(blockhash){
                wallet.request('getblock', [blockhash['result']]).then(function(block){
                    
                    block['result']['totvin'] = 0
                    block['result']['totvout'] = 0
                    block['result']['fees'] = 0
                    block['result']['balances'] = {}
                    block['result']['data'] = {}

                    //PARSING ALL TRANSACTIONS
                    new Promise (async resolve => {
                        for(var i = 0; i < block['result']['tx'].length; i++){
                            var txid = block['result']['tx'][i]
                            
                            var rawtx = await wallet.request('getrawtransaction', [txid])
                            var tx = await wallet.request('decoderawtransaction', [rawtx['result']])
                            block['result']['tx'][i] = tx['result']
                            var txtotvin = 0
                            var txtotvout = 0
                            //FETCHING ALL VIN
                            for(var vinx = 0; vinx < block['result']['tx'][i]['vin'].length; vinx++){
                                var vout =  block['result']['tx'][i]['vin'][vinx]['vout']
                                if(block['result']['tx'][i]['vin'][vinx]['txid']){
                                    var rawtxvin = await wallet.request('getrawtransaction', [tx['result']['vin'][vinx]['txid']])
                                    var txvin = await wallet.request('decoderawtransaction', [rawtxvin['result']])
                                    block['result']['tx'][i]['vin'][vinx]['value'] = txvin['result']['vout'][vout]['value']
                                    block['result']['totvin'] += txvin['result']['vout'][vout]['value']
                                    block['result']['tx'][i]['vin'][vinx]['addresses'] = txvin['result']['vout'][vout]['scriptPubKey']['addresses']
                                    for(var key in txvin['result']['vout'][vout]['scriptPubKey']['addresses']){
                                        var address = txvin['result']['vout'][vout]['scriptPubKey']['addresses'][key]
                                        if(block['result']['balances'][txid] === undefined){
                                            block['result']['balances'][txid] = {}
                                        }
                                        if(block['result']['balances'][txid][address] === undefined){
                                            block['result']['balances'][txid][address] = {}
                                            block['result']['balances'][txid][address]['value'] = 0
                                            block['result']['balances'][txid][address]['vin'] = 0
                                            block['result']['balances'][txid][address]['vout'] = 0
                                            block['result']['balances'][txid][address]['type'] = 'TX'
                                        }
                                        block['result']['balances'][txid][address]['value'] -= txvin['result']['vout'][vout]['value']
                                        block['result']['balances'][txid][address]['vin'] += txvin['result']['vout'][vout]['value']
                                        txtotvin += txvin['result']['vout'][vout]['value']
                                    }
                                }
                            }
                            //PARSING ALL VOUT
                            var receivingaddress = ''
                            for(var voutx = 0; voutx < block['result']['tx'][i]['vout'].length; voutx++){
                                if(block['result']['tx'][i]['vout'][voutx]['value'] >= 0){
                                    block['result']['totvout'] += block['result']['tx'][i]['vout'][voutx]['value']
                                    //CHECKING VALUES OUT
                                    if(block['result']['tx'][i]['vout'][voutx]['scriptPubKey']['addresses']){
                                        block['result']['tx'][i]['vout'][voutx]['scriptPubKey']['addresses'].forEach(function(address, index){
                                            if(block['result']['balances'][txid] === undefined){
                                                block['result']['balances'][txid] = {}
                                            }
                                            if(block['result']['balances'][txid][address] === undefined){
                                                block['result']['balances'][txid][address] = {}
                                                block['result']['balances'][txid][address]['value'] = 0
                                                block['result']['balances'][txid][address]['vin'] = 0
                                                block['result']['balances'][txid][address]['vout'] = 0
                                                block['result']['balances'][txid][address]['type'] = 'TX'
                                            }
                                            block['result']['balances'][txid][address]['value'] += block['result']['tx'][i]['vout'][voutx]['value']
                                            block['result']['balances'][txid][address]['vout'] += block['result']['tx'][i]['vout'][voutx]['value']

                                            txtotvout += block['result']['tx'][i]['vout'][voutx]['value']
                                            receivingaddress = address
                                        })
                                    }
                                    //CHECKING OP_RETURN
                                    if(block['result']['tx'][i]['vout'][voutx]['scriptPubKey']['asm'].indexOf('OP_RETURN') !== -1){
                                        var OP_RETURN = wallet.hex2a(block['result']['tx'][i]['vout'][voutx]['scriptPubKey']['asm'].replace('OP_RETURN ',''))
                                        if(block['result']['data'][receivingaddress] === undefined){
                                            block['result']['data'][receivingaddress] = []
                                        }
                                        block['result']['data'][receivingaddress].push(OP_RETURN)
                                    }
                                }
                            }

                            //CHECKING GENERATION
                            var generated = 0
                            if(txtotvin < txtotvout){
                                generated = txtotvout - txtotvin
                                block['result']['generated'] = generated 
                            }
                        }

                        //CALCULATING FEES
                        var blocktotvalue = block['result']['totvin'] + block['result']['generated']
                        block['result']['fees'] = (block['result']['totvout'] - blocktotvalue ) * -1

                        //CHECKING TRANSACTION TYPE
                        for(let txid in block['result']['balances']){
                            for(let address in block['result']['balances'][txid]){
                                if(block['result']['balances'][txid][address]['vin'] > 0){
                                    if(block['result']['balances'][txid][address]['vin'] < block['result']['balances'][txid][address]['vout']){
                                        block['result']['balances'][txid][address]['type'] = 'STAKE'
                                    }
                                }else{
                                    block['result']['balances'][txid][address]['type'] = 'REWARD'
                                }
                            }
                        }
                        response(block['result'])
                    })   
                })
            })
        })
    }

  }

}

export = Crypto;