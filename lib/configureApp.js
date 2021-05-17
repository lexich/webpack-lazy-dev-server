"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const interceptor_1 = __importDefault(require("./interceptor"));
function configureAdmin(app, { entryList }) {
    app.post("/entry", (req, res, next) => {
        if (!req.body) {
            return next(new Error("Invalid request"));
        }
        const entry = req.body.entry;
        if (!entry) {
            return next(new Error("Invalid request"));
        }
        entryList.create(entry, req.body.checked ? "fill" : "empty").then(() => {
            res.json({ ok: true }).end();
        }, () => {
            res.json({ ok: false }).end();
        });
    });
    app.get("/admin", (req, res) => {
        const body = entryList.entries.map((entry) => {
            return `<li><label><input type='checkbox' ${entry.state === "fill" ? "checked" : ""} data-entry="${entry.name}" onchange="send(this)" />${entry.name}</label></li>`;
        });
        res.send(`<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
    <ul>${body.join("")}</ul>
    <script>
    function send(e) {
      var entry = e.dataset.entry;
      fetch('/entry', {
        method: 'POST',
        body: JSON.stringify({ entry: entry + '.js', checked: e.checked }),
        headers: { 'Content-Type': 'application/json' }
      }).then(d => d.json());
    }
    </script>
    </body>
    </html>`);
    });
}
function configureApp(app, { config, compiler, entryList }) {
    var _a, _b;
    app.use(cors_1.default());
    app.use(express_1.default.json());
    configureAdmin(app, { entryList });
    app.use(interceptor_1.default({ entryList }));
    app.use(webpack_dev_middleware_1.default(compiler, {
        publicPath: ((_b = (_a = config.output) === null || _a === void 0 ? void 0 : _a.publicPath) !== null && _b !== void 0 ? _b : "/"),
    }));
    app.use(webpack_hot_middleware_1.default(compiler));
    return app;
}
exports.default = configureApp;
//# sourceMappingURL=configureApp.js.map