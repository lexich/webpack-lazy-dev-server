"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.webpack = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const webpack_1 = __importDefault(require("webpack"));
exports.webpack = webpack_1.default;
const EntryList_1 = __importDefault(require("./EntryList"));
const configureApp_1 = __importDefault(require("./configureApp"));
function createServer(_a) {
    var { packsDirectory, host, code, srcVirtual } = _a, options = __rest(_a, ["packsDirectory", "host", "code", "srcVirtual"]);
    return __awaiter(this, void 0, void 0, function* () {
        // new virtual directory for entries
        const SRC = srcVirtual ||
            path_1.default.join(process.cwd(), "node_modules", ".cache", "webpack-lazy-dev-server");
        const { instance: entryList, compiler, config, } = yield EntryList_1.default.build(Object.assign({ SRC,
            packsDirectory,
            code,
            host }, options));
        return configureApp_1.default(express_1.default(), {
            config,
            entryList,
            compiler,
        });
    });
}
exports.createServer = createServer;
//# sourceMappingURL=index.js.map