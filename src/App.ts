import * as express from 'express'
import * as Utilities from './libs/Utilities'
import * as wallet from "./routes/Wallet"
import * as manage from "./routes/Manage"
import * as explorer from "./routes/Explorer"

var bodyParser = require('body-parser')
var cors = require('cors')

class App {
  public express
  public db
  public Wallet

  constructor () {
    const app = this
    app.express = express()

    app.express.use(bodyParser.json())
    app.express.use(bodyParser.urlencoded({extended: true}))
    app.express.use(express.static('public'))
    app.express.use(cors())
    
    app.express.get('/wallet/getinfo',wallet.getinfo)
    app.express.post('/wallet/getblock',wallet.getblock)

    app.express.post('/watch/:address',manage.watch)
    app.express.post('/unwatch/:address',manage.unwatch)
    app.express.post('/watchlist',manage.watchlist)
    
    app.express.get('/',explorer.info)
    app.express.get('/transactions/:address', explorer.transactions)
    app.express.get('/balance/:address', explorer.balance)
    app.express.get('/stats/:address', explorer.stats)
    app.express.get('/unspent/:address', explorer.unspent)
  }
}

export default new App().express
