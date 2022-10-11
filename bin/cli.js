"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const helper_js_1 = require("./helper.js");
const build_js_1 = __importDefault(require("./build.js"));
function logOut(...args) {
    (0, helper_js_1.logError)(args);
    process.exit(1);
}
commander_1.program.version("1.0.0")
    .arguments("<entrypoint> [output].lua")
    .action((fp, outputPath) => {
    const filePath = path_1.default.resolve(fp);
    if (!fs_1.default.existsSync(filePath) || fs_1.default.lstatSync(filePath).isDirectory())
        logOut(`Could not find file "${path_1.default.parse(filePath).name}", did you forget the file extension?`);
    const output = (0, build_js_1.default)(filePath);
    if (output && outputPath)
        fs_1.default.writeFileSync(path_1.default.resolve(outputPath), output);
    else {
        (0, helper_js_1.logError)("No output file path was given, logging instead.");
        (0, helper_js_1.logInfo)("Start of output");
        (0, helper_js_1.log)(output);
        (0, helper_js_1.logInfo)("End of output");
    }
})
    .parse(process.argv);
if (!commander_1.program.args.length)
    commander_1.program.help();
