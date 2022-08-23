import chalk from 'chalk'
export function log (color, message) {
  if (process.argv.indexOf('-v') > -1) console.log(chalk[color](message))
}
export function logError(message) {
  console.log(chalk.red(message))
  process.exit(1)
}