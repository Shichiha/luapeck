"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const hasha_1 = __importDefault(require("hasha"));
const helper_js_1 = require("./helper.js");
const requireTemplate = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "..", "assets", "require.lua"), "utf-8");
const loadTemplate = (hash, data) => {
    return `proxy_package.packages['${hash.substr(0, 8)}'] = function()\n\t${data}\nend\n`;
};
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g;
function nomatch(file) {
    file = path_1.default.resolve(file);
    let fileData = fs_1.default.readFileSync(file).toString();
    if (!fileData.match(requireRegexp)) {
        (0, helper_js_1.log)("[INFO]\t", "No require found in module... returning file");
        return false;
    }
}
function buildModule(filePath) {
    (0, helper_js_1.log)("[INFO]\t", "Running in Verbose Mode");
    filePath = path_1.default.resolve(filePath);
    let fileData = fs_1.default.readFileSync(filePath).toString();
    let mainHash = (0, hasha_1.default)(filePath);
    if (nomatch(filePath))
        return filePath;
    let modules = new Map();
    function parseFileModules(module, hash) {
        let moduleFolder = path_1.default.dirname(module);
        (0, helper_js_1.log)("[INFO]\t", "Parsing module: " + path_1.default.relative(moduleFolder, module));
        if (nomatch(module))
            return module;
        fs_1.default.existsSync(module) ? null : (0, helper_js_1.logError)(`Could not find module "${path_1.default.parse(module).name}", did you forget the file extension?`);
        let moduleData = fs_1.default.readFileSync(module, "utf8");
        modules.set(hash, true);
        let outputData = moduleData
            .replace(requireRegexp, (_, match) => {
            let reqPath = path_1.default.resolve(moduleFolder, match);
            let reqHash = (0, hasha_1.default)(reqPath);
            !modules.has(reqHash) ? parseFileModules(reqPath, reqHash) : null;
            return `require('${reqHash.slice(0, 8)}')`;
        })
            .replace(/\n/g, "\n\t");
        modules.set(hash, outputData);
    }
    parseFileModules(filePath, mainHash);
    var outputData = requireTemplate;
    modules.forEach((data, hash) => {
        outputData += loadTemplate(hash, data);
    });
    outputData += `require('${mainHash.slice(0, 8)}')\n`;
    return outputData;
}
exports.default = buildModule;
