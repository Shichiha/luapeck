const fs = require('fs-extra')
const path = require('path')
const md5Hex = require('md5-hex')

const load_moduleTemplate = fs.readFileSync(__dirname+'/load_module.lua', 'utf8')
const loadTemplate = (hash, data, filePath) => {
  data = data.replace(/\n/g, '\n\t')
  return `proxy_package.packages['${hash.substr(0,8)}'] = function()\n\t${data}\nend\n`
}

module.exports.build = build

const load_moduleRegexp = /load_module\(?(?:"|')([^"']+)(?:"|')\)?/g

function build(mainFile) {
  mainFile = path.resolve(mainFile)
  var mainPath = path.parse(mainFile).dir
  var mainHash = md5Hex(mainFile)

  var packages = new Map()

  function parseFile(file, hash) {
    let fileName = path.basename(file, '.lua')
    let mainPath = path.dirname(file)
    const inputData = fs.readFileSync(path.format({
      dir: mainPath,
      name: fileName,
      ext: '.lua'
    }), 'utf8')

    packages.set(hash, true) // reserve package

    const outputData = inputData.replace(load_moduleRegexp, (_, match) => {
      var reqPath = path.resolve(mainPath,match)
      var reqHash = md5Hex(reqPath)

      if (!packages.has(reqHash)) {
        parseFile(reqPath, reqHash)
      }

      return `load_module('${reqHash.substr(0,8)}')` // replace file path with hash
    })

    packages.set(hash, outputData)
  }
  
  parseFile(mainFile, mainHash)

  var outputData = load_moduleTemplate

  packages.forEach((data, hash) => {
    outputData += loadTemplate(hash, data)
  })

  outputData += `load_module('${mainHash.substr(0,8)}')\n` // load_module the main file

  return outputData
}
