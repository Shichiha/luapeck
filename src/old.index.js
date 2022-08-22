const fs = require('fs-extra')
const path = require('path')
const md5Hex = require('md5-hex')

const requireTemplate = fs.readFileSync(__dirname+'/require.lua', 'utf8')
const loadTemplate = (hash, data, filePath) => {
  data = data.replace(/\n/g, '\n\t')
  return `proxy_package.packages['${hash.substr(0,8)}'] = function()\n\t${data}\nend\n`
}

module.exports.build = build

const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g

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

    const outputData = inputData.replace(requireRegexp, (_, match) => {
      var reqPath = path.resolve(mainPath,match)
      var reqHash = md5Hex(reqPath)

      if (!packages.has(reqHash)) {
        parseFile(reqPath, reqHash)
      }

      return `require('${reqHash.substr(0,8)}')` // replace file path with hash
    })

    packages.set(hash, outputData)
  }
  
  parseFile(mainFile, mainHash)

  var outputData = requireTemplate

  packages.forEach((data, hash) => {
    outputData += loadTemplate(hash, data)
  })

  outputData += `require('${mainHash.substr(0,8)}')\n` // require the main file

  return outputData
}
