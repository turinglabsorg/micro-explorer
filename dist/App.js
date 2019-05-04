"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const wallet = require("./routes/Wallet");
const manage = require("./routes/Manage");
const explorer = require("./routes/Explorer");
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
        app.express.post('/wallet/getblock', wallet.getblock);
        app.express.post('/watch/:address', manage.watch);
        app.express.post('/unwatch/:address', manage.unwatch);
        app.express.post('/sync/:address', manage.sync);
        app.express.post('/watchlist', manage.watchlist);
        app.express.get('/', explorer.info);
        app.express.get('/transactions/:address', explorer.transactions);
        app.express.get('/balance/:address', explorer.balance);
        app.express.get('/stats/:address', explorer.stats);
        app.express.get('/unspent/:address', explorer.unspent);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map