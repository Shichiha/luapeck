export function log(...args: any[]) {
  console.log(...args);
}

export function logInfo(...args: any[]) {
  console.log('\x1b[33m', ...args, '\x1b[0m');
}
export function logError(...args: any[]) {
  console.error('\x1b[31m', ...args, '\x1b[0m');
}