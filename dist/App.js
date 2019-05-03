"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const wallet = require("./routes/Wallet");
const manage = require("./routes/Manage");
const explorer = require("./routes/Explorer");
var Engine = require('tingodb')();
var bodyParser = require('body-parser');
var cors = require('cors');
class App {
    constructor() {
        const app = this;
        app.express = express();
        app.db = new Engine.Db('./db', {});
        app.express.use(bodyParser.json());
        app.express.use(bodyParser.urlencoded({ extended: true }));
        app.express.use(express.static('public'));
        app.express.use(cors());
        app.express.get('/wallet/getinfo', wallet.getinfo);
        app.express.post('/wallet/getblock', wallet.getblock);
        app.express.post('/manage/watch', manage.watch);
        app.express.post('/manage/unwatch', manage.unwatch);
        app.express.post('/manage/watchlist', manage.watchlist);
        app.express.get('/', explorer.info);
        app.express.get('/transactions/:address', explorer.transactions);
        app.express.get('/balance/:address', explorer.balance);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map