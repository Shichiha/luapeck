import fs from "fs";
import path from "path";
import { logInfo, logError } from "./helper.js";

const requireTemplate = fs.readFileSync(path.resolve(__dirname, "..", "assets", "require.lua"), "utf-8")
const loadTemplate = (hash: string, data: string) => {
  return `pmanager.packages['${hash.substr(0, 8)}'] = function()\n\t${data}\nend\n`;
};
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g;

function getIdentifier(file: string) {
  return path.parse(file).name
}

function noRequires(file: string) {
  file = path.resolve(file)
  let fileData = fs.readFileSync(file).toString();
  if (!fileData.match(requireRegexp)) {
    logInfo("[INFO]\t", "No require found in module " + path.parse(file).name + " ... returning file");
    return false;
  }
}

function Indent(input: string) {
  return input.replace(/\n/g, "\n\t");
}

function parseModule(module: string, hash: string, modules: Map<any, any>) {
  let moduleFolder = path.dirname(module);
  logInfo("[INFO]\t", "Parsing module: " + path.relative(moduleFolder, module));
  if (noRequires(module)) return module;
  if (!fs.existsSync(module))
    logError(`Could not find module "${path.parse(module).name}", did you forget the file extension?`)

  let moduleData = fs.readFileSync(module, "utf8");

  let outputData = moduleData
    .replace(requireRegexp, (_: string, match: string) => {
      let reqPath = path.resolve(moduleFolder, match);
      let reqHash = getIdentifier(reqPath)
      !modules.has(reqHash) ? parseModule(reqPath, reqHash, modules) : null;
      return `require('${reqHash.slice(0, 8)}')`;
    })

  outputData = Indent(outputData)

  modules.set(hash, outputData);
}

export default function Pack(filePath: string) {
  filePath = path.resolve(filePath)
  let mainHash = getIdentifier(filePath)

  if (noRequires(filePath)) return filePath;
  let modules = new Map();

  parseModule(filePath, mainHash, modules);
  var outputData = requireTemplate;

  modules.forEach((data, hash) => {
    outputData += loadTemplate(hash, data);
  });

  outputData += `require('${mainHash.slice(0, 8)}')\n`;
  return outputData;
}