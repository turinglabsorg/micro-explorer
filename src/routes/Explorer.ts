import express = require("express")
import * as Utilities from '../libs/Utilities'

export function info(req: express.Request, res: express.Response) {
    res.json({status: "ONLINE"})
};