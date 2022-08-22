import path from 'path'
import fs from 'fs'
const __dirname = path.resolve('./src/')
import build from './build.js'
function loadTemplate (moduleName, data) {
  return `proxy_package.packages['${moduleName}'] = function()\n\t${data}\nend\n`
}
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g

function initFile (relativePath) {
  const absolutePath = path.join(process.cwd(), relativePath)
}

import inquirer from 'inquirer'
import chalk from 'chalk'

function parsePath (args) {
  let cArgs = args[2]
  let execPath = path.resolve('./')
  if (cArgs && cArgs.indexOf('-p') > -1)
    fs.existsSync(args[3])
      ? (execPath = args[3])
      : console.log(chalk.red('Invalid Path Argument.'))
  return execPath
}

export function initProject (args) {
  let executePath = parsePath(args)
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'mainFile',
        message: chalk.greenBright('Which file do you want to pack?'),
        choices: fs.readdirSync(executePath),
        default: 'main.lua'
      },
      {
        type: 'input',
        name: 'output',
        message: chalk.greenBright('Output file name'),
        default: 'packed.lua'
      }
    ])
    .then(answers => {
      const config = {
        mainFile: answers.mainFile,
        output: answers.output
      }
      fs.writeFileSync(
        path.join(executePath, 'luapeck.config.json'),
        JSON.stringify(config)
      )
    })
}

function pack (args) {
  let pathArg = parsePath(args) 
    if (!fs.lstatSync(pathArg).isDirectory()) {
        return
    }
  if (!fs.existsSync(path.join(pathArg, 'luapeck.config.json'))) {
    console.log(chalk.red('No config file found at ' + pathArg))
    return // TODO: create config file
  }
  console.log(chalk.green('Found config file! Packing...'))
  build('test/test.lua')
}

export default pack
