"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Engine = require('tingodb')();
var formidable = require('formidable');
var Utilities;
(function (Utilities) {
    class Parser {
        body(req) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(response => {
                    var jsonEmpty = true;
                    for (var key in req.body) {
                        if (key !== undefined) {
                            jsonEmpty = false;
                        }
                    }
                    if (jsonEmpty === true) {
                        var form = new formidable.IncomingForm();
                        form.parse(req, function (err, fields, files) {
                            response(fields);
                        });
                    }
                    else {
                        response(req.body);
                    }
                });
            });
        }
    }
    Utilities.Parser = Parser;
})(Utilities || (Utilities = {}));
module.exports = Utilities;
//# sourceMappingURL=Utilities.js.map