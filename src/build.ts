import fs from "fs";
import path from "path";
import hasha from "hasha";
import { log, logError } from "./helper.js";

const requireTemplate = fs.readFileSync(path.resolve(__dirname, "..", "assets", "require.lua"), "utf-8")
const loadTemplate = (hash: string, data: string) => {
  return `proxy_package.packages['${hash.substr(0, 8)}'] = function()\n\t${data}\nend\n`;
};
const requireRegexp = /require\(?(?:"|')([^"']+)(?:"|')\)?/g;

/**
 * If the file doesn't have a require statement, return false
 * @param {string} file - The file to be checked
 * @returns The file is being returned.
 */
function noRequires(file: string) {
  file = path.resolve(file)
  let fileData = fs.readFileSync(file).toString();
  if (!fileData.match(requireRegexp)) {
    log("[INFO]\t", "No require found in module... returning file");
    return false;
  }
}

/**
 * all newlines replaced with newlines and tabs.
 * @param {string} input - The string to be indented.
 * @returns The input string with all newlines replaced with newlines and tabs.
 */
function Indent(input: string) {
  return input.replace(/\n/g, "\n\t");
}

/**
 * It takes a module, a hash, and a map of modules, and if the module has no requires, it returns the
 * module, otherwise it parses the module, and replaces the requires with the hash of the required
 * module.
 * @param {string} module - The path to the module you want to parse
 * @param {string} hash - The hash of the module
 * @param modules - Map<any, any>
 * @returns The module data is being returned.
 */
function parseModule(module: string, hash: string, modules: Map<any, any>) {
  let moduleFolder = path.dirname(module);
  log("[INFO]\t", "Parsing module: " + path.relative(moduleFolder, module));
  if (noRequires(module)) return module;
  if (!fs.existsSync(module))
    logError(`Could not find module "${path.parse(module).name}", did you forget the file extension?`)

  let moduleData = fs.readFileSync(module, "utf8");

  /* Replacing the require statements with the hash of the module. */
  let outputData = moduleData
    .replace(requireRegexp, (_: string, match: string) => {
      let reqPath = path.resolve(moduleFolder, match);
      let reqHash = hasha(reqPath);
      !modules.has(reqHash) ? parseModule(reqPath, reqHash, modules) : null;
      return `require('${reqHash.slice(0, 8)}')`;
    })

  /* Adding a tab to the beginning of every line. */
  outputData = Indent(outputData)

  /* Setting the hash of the module to the outputData. */
  modules.set(hash, outputData);
}

/**
 * It takes a file path, and returns a string of lua code that will load the file and all of its
 * dependencies
 * @param {string} filePath - The path to the file you want to pack.
 * @returns The outputData variable is being returned.
 */
export default function Pack(filePath: string) {
  filePath = path.resolve(filePath)
  let mainHash = hasha(filePath);

  if (noRequires(filePath)) return filePath;
  let modules = new Map();

  // Starting to parse the root file.
  parseModule(filePath, mainHash, modules);
  var outputData = requireTemplate;

  // After parsing, transform!
  modules.forEach((data, hash) => {
    outputData += loadTemplate(hash, data);
  });

  // Replace the requires with their hashes
  outputData += `require('${mainHash.slice(0, 8)}')\n`;
  return outputData;
}