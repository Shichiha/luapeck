import fs from "fs";
import path from "path";
import hasha from "hasha";
import { log, logError } from "./helper.js";

const requireTemplate = fs.readFileSync(path.resolve(__dirname, "..", "assets", "require.lua"), "utf-8")
const loadTemplate = (hash: string, data: string) => {
  return `proxy_package.packages['${hash.substr(0, 8)}'] = function()\n\t${data}\nend\n`;
};
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g;

function nomatch(file: string) {
  file = path.resolve(file)
  let fileData = fs.readFileSync(file).toString();
  if (!fileData.match(requireRegexp)) {
    log("[INFO]\t", "No require found in module... returning file");
    return false;
  }
}

function buildModule(filePath: string) {
  log("[INFO]\t","Running in Verbose Mode")
  filePath = path.resolve(filePath)

  let fileData = fs.readFileSync(filePath).toString();
  let mainHash = hasha(filePath);
  if (nomatch(filePath)) return filePath;
  let modules = new Map();

  function parseFileModules(module: string, hash: string) {
    let moduleFolder = path.dirname(module);
    log("[INFO]\t", "Parsing module: " + path.relative(moduleFolder, module));
    if (nomatch(module)) return module;
    fs.existsSync(module) ? null : logError(`Could not find module "${path.parse(module).name}", did you forget the file extension?`);
    let moduleData = fs.readFileSync(module, "utf8");
    modules.set(hash, true);
    let outputData = moduleData
      .replace(requireRegexp, (_: string, match: string) => {
        let reqPath = path.resolve(moduleFolder, match);
        let reqHash = hasha(reqPath);
        !modules.has(reqHash) ? parseFileModules(reqPath, reqHash) : null;
        return `require('${reqHash.slice(0, 8)}')`;
      })
      .replace(/\n/g, "\n\t");
    modules.set(hash, outputData);
  }
  parseFileModules(filePath, mainHash);
  var outputData = requireTemplate;
  modules.forEach((data, hash) => {
    outputData += loadTemplate(hash, data);
  });
  outputData += `require('${mainHash.slice(0, 8)}')\n`;
  return outputData;
}
export default buildModule;