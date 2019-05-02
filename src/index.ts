import app from './App'
import * as Crypto from './libs/Crypto'
import * as Background from "./libs/Background"

require('dotenv').config()
const port = process.env.PORT || 4001
app.engine('html', require('ejs').renderFile);

app.listen(port, (err) => {
  if (err) {
    return console.log(err)
  }
  var wallet = new Crypto.Wallet;
  wallet.request('getinfo').then(function(info){
    if(info !== undefined){
      console.log(process.env.COIN + ' wallet successfully connected.')
      var task = new Background.Sync
      task.init()
    }else{
      console.log('Can\'t communicate with wallet, please check RPC.')
    }
  })
  return console.log(`MircoExplorer listening at port ${port}`)
})