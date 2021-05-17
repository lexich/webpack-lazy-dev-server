"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
function interceptor({ entryList }) {
    const fn = (req, res, next) => {
        const url = req.url
            ? path_1.default.relative(entryList.publicPath, req.url)
            : req.url;
        entryList.create(url, "fill").then(() => next(), () => next());
    };
    return fn;
}
exports.default = interceptor;
//# sourceMappingURL=interceptor.js.map