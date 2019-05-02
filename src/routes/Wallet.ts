import express = require("express")
import * as Crypto from '../libs/Crypto'
import * as Utilities from '../libs/Utilities'

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

export function getinfo(req: express.Request, res: express.Response) {
    var wallet = new Crypto.Wallet;
    wallet.request('getinfo').then(function(info){
        res.json(info['result'])
    })
};

export function getblock(req: express.Request, res: express.Response) {
    var wallet = new Crypto.Wallet;
    var utilities = new Utilities.Parser
    utilities.body(req).then(function(body){
        if(body['block']){
            wallet.request('getblockhash', [parseInt(body['block'])]).then(function(blockhash){
                wallet.request('getblock', [blockhash['result']]).then(function(block){
                    
                    block['result']['totvin'] = 0
                    block['result']['totvout'] = 0
                    block['result']['fees'] = 0
                    block['result']['balances'] = {}
                    block['result']['data'] = {}

                    new Promise (async resolve => {
                        //PARSING ALL TRANSACTIONS
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
                                    txvin['result']['vout'][vout]['scriptPubKey']['addresses'].forEach(function(address, index){
                                        if(block['result']['balances'][txid][address] === undefined){
                                            block['result']['balances'][txid][address] = 0
                                        }
                                        block['result']['balances'][txid][address] -= txvin['result']['vout'][vout]['value']
                                        txtotvin += txvin['result']['vout'][vout]['value']
                                    })
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
                                            if(block['result']['balances'][address] === undefined){
                                                block['result']['balances'][address] = 0
                                            }
                                            block['result']['balances'][address] += block['result']['tx'][i]['vout'][voutx]['value']

                                            txtotvout += block['result']['tx'][i]['vout'][voutx]['value']
                                            receivingaddress = address
                                        })
                                    }
                                    //CHECKING OP_RETURN
                                    if(block['result']['tx'][i]['vout'][voutx]['scriptPubKey']['asm'].indexOf('OP_RETURN') !== -1){
                                        var OP_RETURN = hex2a(block['result']['tx'][i]['vout'][voutx]['scriptPubKey']['asm'].replace('OP_RETURN ',''))
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

                        resolve(
                            res.json({
                                data: block['result'],
                                status: 422
                            })
                        )
                    })
                })
            })
        }else{
            res.json({
                data: 'Missing parameter: block',
                status: 422
            })
        }
    })
};