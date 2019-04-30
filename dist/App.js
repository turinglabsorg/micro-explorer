"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const walletRouter = require("./routes/Wallet");
const explorerRouter = require("./routes/Explorer");
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
        app.express.get('/', explorerRouter.info);
        app.express.get('/wallet/getinfo', walletRouter.getinfo);
        app.express.post('/wallet/getbalance', walletRouter.getbalance);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map