"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const wallet = require("./routes/Wallet");
const explorer = require("./routes/Explorer");
const manage = require("./routes/Manage");
var bodyParser = require('body-parser');
var cors = require('cors');
class App {
    constructor() {
        const app = this;
        app.express = express();
        app.express.use(bodyParser.json());
        app.express.use(bodyParser.urlencoded({ extended: true }));
        app.express.use(express.static('public'));
        app.express.use(cors());
        app.express.get('/wallet/getinfo', wallet.getinfo);
        app.express.get('/wallet/masternodelist', wallet.getmasternodelist);
        app.express.get('/watch/:address', manage.watch);
        app.express.get('/unwatch/:address', manage.unwatch);
        app.express.get('/watchlist', manage.watchlist);
        app.express.get('/', explorer.info);
        app.express.get('/resync', explorer.resync);
        app.express.get('/block/:block', explorer.getblock);
        app.express.get('/transaction/:txid', explorer.gettransaction);
        app.express.get('/transactions/:address', explorer.transactions);
        app.express.get('/balance/:address', explorer.balance);
        app.express.get('/stats/:address', explorer.stats);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map