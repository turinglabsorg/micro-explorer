import app from './App'
import * as Crypto from './libs/Crypto'
import * as Daemon from "./libs/Daemon"
let {nextAvailable} = require('node-port-check')
require('dotenv').config()

const microexplorer = async () => {
  let port = await nextAvailable(3001, '0.0.0.0')
  app.engine('html', require('ejs').renderFile);
  
  app.listen(port, (err) => {
    if (err) {
      return console.log(err)
    }
    var wallet = new Crypto.Wallet;
    wallet.request('getinfo').then(function(info){
      if(info !== undefined){
        console.log(process.env.COIN + ' wallet successfully connected.')
        var task
        task = new Daemon.Sync
        task.init()
      }else{
        console.log('Can\'t communicate with wallet, please check RPC.')
      }
    })
    return console.log(`MircoExplorer listening at port ${port}`)
  })
}

microexplorer()