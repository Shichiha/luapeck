import path from 'path'
import fs from 'fs'
import buildModule from './build.js'
import inquirer from 'inquirer'
import { log,logError } from './helper.js'
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
        message: log('greenbright','Which file do you want to pack?'),
        choices: fs.readdirSync(executePath),
        default: 'main.lua'
      },
      {
        type: 'input',
        name: 'output',
        message: log('greenbright','Output file name'),
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
const removeComments = (filedata) => {
  let lines = filedata.split('\n')
  let newLines = []
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (line.startsWith('--')) 
      continue
    newLines.push(line)
  }
  return newLines.join('\n')
}
function peck (args, isFile, output) {
  let built = buildModule(args)
  let toOutput = output == null ? 'packed.lua' : output
  log('green', 'Packing finished!')
  let filePath = path.resolve(args, isFile ? '../' : '')
  fs.writeFileSync(path.join(filePath, toOutput), built)
  log('green', `Output file Saved: ${path.resolve(filePath,toOutput)}`)
}
function init (args) {
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

export default init
