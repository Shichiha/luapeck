export function log(...args: any[]) {
  console.log(...args);
}
export function logError(...args: any[]) {
  log('\x1b[31m', ...args, '\x1b[0m');
}