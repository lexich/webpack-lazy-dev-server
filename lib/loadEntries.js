"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const statAsync = util_1.promisify(fs_1.default.stat);
const readdirAsync = util_1.promisify(fs_1.default.readdir);
function loadEntries(dir, acceptFile) {
    const result = {};
    return readdirAsync(dir)
        .then((files) => {
        const defer = files.map((file) => {
            const filePath = path_1.default.join(dir, file);
            return statAsync(filePath)
                .then((stat) => {
                if (stat.isDirectory()) {
                    return loadEntries(filePath, acceptFile).then((res) => {
                        Object.assign(result, res);
                        return;
                    });
                }
                else if (stat.isFile()) {
                    const isEntry = acceptFile ? acceptFile(filePath) : true;
                    if (isEntry) {
                        const ext = path_1.default.extname(filePath);
                        const name = path_1.default.basename(filePath, ext);
                        result[name] = filePath;
                    }
                    return;
                }
            })
                .catch(() => {
                return;
            });
        });
        return Promise.all(defer).then(() => result);
    })
        .catch(() => result);
}
exports.default = loadEntries;
//# sourceMappingURL=loadEntries.js.map