import fs from 'fs'
import path from 'path'
import md5Hex from 'md5-hex'
import { log, logError } from './helper.js'
let binDir = path.resolve(process.argv[1], '../../bin')
const requireTemplate = fs.readFileSync(binDir + '/require.lua', 'utf8')
const loadTemplate = (hash, data) => {return `proxy_package.packages['${hash.substr(0,8)}'] = function()\n\t${data}\nend\n`}
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g

function nomatch(file) {
  if (!file.match(requireRegexp)) 
    log('yellow','No require found in module... returning file')
    return false;
}
function buildModule (mainFile) {
  mainFile = path.resolve(mainFile)
  let mainHash = md5Hex(mainFile)
  if (nomatch(mainFile)) return mainFile
  let modules = new Map()
  function parseFileModules (module, hash) {
    let moduleFolder = path.dirname(module)
    log('yellow','Parsing module: ' + path.relative(moduleFolder, module))
    if (nomatch(module)) return module
    fs.existsSync(module) ? null : logError(`Could not find module "${path.parse(module).name}", did you forget the file extension?`) 
    let moduleData = fs.readFileSync(module, 'utf8')
    modules.set(hash, true)
    let outputData = moduleData
      .replace(requireRegexp, (_, match) => {
        let reqPath = path.resolve(moduleFolder, match)
        let reqHash = md5Hex(reqPath)
        !modules.has(reqHash) ? parseFileModules(reqPath, reqHash) : null
        return `require('${reqHash.slice(0, 8)}')`
      })
      .replace(/\n/g, '\n\t')
    modules.set(hash, outputData)
  }
  parseFileModules(mainFile, mainHash)
  var outputData = requireTemplate
  modules.forEach((data, hash) => {
    outputData += loadTemplate(hash, data)
  })
  outputData += `require('${mainHash.slice(0, 8)}')\n`
  return outputData
}
export default buildModule