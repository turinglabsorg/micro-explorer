"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const wallet = require("./routes/Wallet");
const stats = require("./routes/Stats");
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
        app.express.get('/', explorer.info);
        app.express.get('/wallet/getinfo', wallet.getinfo);
        app.express.post('/wallet/getblock', wallet.getblock);
        app.express.post('/stats/watch', stats.watch);
        app.express.post('/stats/unwatch', stats.unwatch);
        app.express.post('/stats/watchlist', stats.watchlist);
        app.express.get('/stats/:address', stats.address);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map