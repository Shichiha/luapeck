import fs from 'fs'
import path from 'path'
import md5Hex from 'md5-hex'
const __dirname = path.resolve('./src/')
let fromDir = process.argv[1]
let srcDir = path.resolve(fromDir, '../../src')
const requireTemplate = fs.readFileSync(srcDir + '/require.lua', 'utf8')
const loadTemplate = (hash, data) => {return `proxy_package.packages['${hash.substr(0,8)}'] = function()\n\t${data}\nend\n`
}
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g

import chalk from 'chalk'
function build (mainFile) {
  mainFile = path.resolve(mainFile)
  var mainHash = md5Hex(mainFile)
  let mainFileData = fs.readFileSync(mainFile, 'utf8')
  var packages = new Map()
  function parseFiles () {
    if (!mainFileData.match(requireRegexp)) {
      console.log(chalk.red('No require found in main file'))
      return mainFileData
    }
    function parseFileModules (module, hash) {
      let mainPath = path.dirname(module)
      console.log(chalk.yellow('Parsing module: ' + path.relative(mainPath, module)))
      const inputData = fs.readFileSync(module, 'utf8')
      packages.set(hash, true)
      const outputData = inputData
        .replace(requireRegexp, (_, match) => {
          var reqPath = path.resolve(mainPath, match)
          var reqHash = md5Hex(reqPath)
          !packages.has(reqHash) ? parseFileModules(reqPath, reqHash) : null
          return `require('${reqHash.substr(0, 8)}')` // replace file path with hash
        })
        .replace(/\n/g, '\n\t')
      packages.set(hash, outputData)
    }
    parseFileModules(mainFile, mainHash)
    var outputData = requireTemplate
    packages.forEach((data, hash) => {
      outputData += loadTemplate(hash, data)
    })
    outputData += `require('${mainHash.substr(0, 8)}')\n` // require the main file
    return outputData
  }
  return parseFiles()
}
export default build
