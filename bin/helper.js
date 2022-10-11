"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logInfo = exports.log = void 0;
function log(...args) {
    console.log(...args);
}
exports.log = log;
function logInfo(...args) {
    console.log('\x1b[33m', ...args, '\x1b[0m');
}
exports.logInfo = logInfo;
function logError(...args) {
    console.error('\x1b[31m', ...args, '\x1b[0m');
}
exports.logError = logError;
