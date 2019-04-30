"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
require('dotenv').config();
const { exec } = require('child_process');
const port = process.env.PORT || 4001;
App_1.default.engine('html', require('ejs').renderFile);
App_1.default.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    return console.log(`MircoExplorer listening at port ${port}`);
});
//# sourceMappingURL=index.js.map