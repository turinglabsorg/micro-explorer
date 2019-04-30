import * as express from 'express'
import * as Utilities from './libs/Utilities'
import * as walletRouter from "./routes/Wallet"
import * as explorerRouter from "./routes/Explorer"

var Engine = require('tingodb')()
var bodyParser = require('body-parser')
var cors = require('cors')

class App {
  public express
  public db
  public Wallet

  constructor () {
    const app = this
    app.express = express()
    app.db = new Engine.Db('./db', {})

    app.express.use(bodyParser.json())
    app.express.use(bodyParser.urlencoded({extended: true}))
    app.express.use(express.static('public'))
    app.express.use(cors())
    
    app.express.get('/',explorerRouter.info)
    app.express.get('/wallet/getinfo',walletRouter.getinfo)
    app.express.post('/wallet/getbalance',walletRouter.getbalance)
  }
}

export default new App().express
