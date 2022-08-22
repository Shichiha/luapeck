import path from 'path'
import fs from 'fs'
import build from './build.js'
function log (color, message) {
  if (process.argv.indexOf('-v') > -1) console.log(chalk[color](message))
}
function logError(message) {
  console.log(chalk.red(message))
  process.exit(1)
}
import inquirer from 'inquirer'
import chalk from 'chalk'

function parsePath (args) {
  let cArgs = args[2]
  let execPath = path.resolve('./')
  if (cArgs && cArgs.indexOf('-p') > -1)
    if (fs.existsSync(args[3])) execPath = args[3]
    else {
      logError('Path not found')
    }
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

function peck (args, isFile, output) {
  let built = build(args)
  let toOutput = output == null ? 'packed.lua' : output
  log('green', 'Packing finished!')
  let filePath = path.resolve(args, isFile ? '../' : '')
  log('green', 'Output file: ' + filePath + '\\' + toOutput)
  fs.writeFileSync(path.join(filePath, toOutput), built)
  log('green', 'Packed file saved!')
}
function pack (args) {
  let pathArg = parsePath(args)
  let isFile = fs.lstatSync(pathArg).isFile()
  if (isFile) {
    let filePath = path.resolve(pathArg)
    peck(filePath, isFile, null)
    return
  }
  let hasConfig = fs.existsSync(path.join(pathArg, 'luapeck.config.json'))
  if (!hasConfig && !isFile) {
    log('red', 'No config file found at ' + pathArg)
    initProject(args)
    return
  }
  log('green', 'Found config file! Packing...')
  let config = JSON.parse(
    fs.readFileSync(path.join(pathArg, 'luapeck.config.json'), 'utf8')
  )

  let mainFile = config.mainFile
  let output = config.output
  let mainFilePath = path.resolve(pathArg, mainFile)
  if (!fs.existsSync(mainFilePath)) {
    log('red', 'Main file not found, please check config file.')
    return
  }
  peck(mainFilePath, true, output)
}

export default pack
