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
/**
 * If the file doesn't have a require statement, return false
 * @param {string} file - The file to be checked
 * @returns The file is being returned.
 */
function noRequires(file) {
    file = path_1.default.resolve(file);
    let fileData = fs_1.default.readFileSync(file).toString();
    if (!fileData.match(requireRegexp)) {
        (0, helper_js_1.log)("[INFO]\t", "No require found in module... returning file");
        return false;
    }
}
/**
 * all newlines replaced with newlines and tabs.
 * @param {string} input - The string to be indented.
 * @returns The input string with all newlines replaced with newlines and tabs.
 */
function Indent(input) {
    return input.replace(/\n/g, "\n\t");
}
/**
 * It takes a module, a hash, and a map of modules, and if the module has no requires, it returns the
 * module, otherwise it parses the module, and replaces the requires with the hash of the required
 * module.
 * @param {string} module - The path to the module you want to parse
 * @param {string} hash - The hash of the module
 * @param modules - Map<any, any>
 * @returns The module data is being returned.
 */
function parseModule(module, hash, modules) {
    let moduleFolder = path_1.default.dirname(module);
    (0, helper_js_1.log)("[INFO]\t", "Parsing module: " + path_1.default.relative(moduleFolder, module));
    if (noRequires(module))
        return module;
    if (!fs_1.default.existsSync(module))
        (0, helper_js_1.logError)(`Could not find module "${path_1.default.parse(module).name}", did you forget the file extension?`);
    let moduleData = fs_1.default.readFileSync(module, "utf8");
    /* Replacing the require statements with the hash of the module. */
    let outputData = moduleData
        .replace(requireRegexp, (_, match) => {
        let reqPath = path_1.default.resolve(moduleFolder, match);
        let reqHash = (0, hasha_1.default)(reqPath);
        !modules.has(reqHash) ? parseModule(reqPath, reqHash, modules) : null;
        return `require('${reqHash.slice(0, 8)}')`;
    });
    /* Adding a tab to the beginning of every line. */
    outputData = Indent(outputData);
    /* Setting the hash of the module to the outputData. */
    modules.set(hash, outputData);
}
/**
 * It takes a file path, and returns a string of lua code that will load the file and all of its
 * dependencies
 * @param {string} filePath - The path to the file you want to pack.
 * @returns The outputData variable is being returned.
 */
function Pack(filePath) {
    filePath = path_1.default.resolve(filePath);
    let mainHash = (0, hasha_1.default)(filePath);
    if (noRequires(filePath))
        return filePath;
    let modules = new Map();
    // Starting to parse the root file.
    parseModule(filePath, mainHash, modules);
    var outputData = requireTemplate;
    // After parsing, transform!
    modules.forEach((data, hash) => {
        outputData += loadTemplate(hash, data);
    });
    // Replace the requires with their hashes
    outputData += `require('${mainHash.slice(0, 8)}')\n`;
    return outputData;
}
exports.default = Pack;
