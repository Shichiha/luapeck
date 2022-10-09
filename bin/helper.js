"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.log = void 0;
function log(...args) {
    console.log(...args);
}
exports.log = log;
function logError(...args) {
    log('\x1b[31m', ...args, '\x1b[0m');
}
exports.logError = logError;
