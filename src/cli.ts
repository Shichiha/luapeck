import fs from "fs";
import path from "path";
import { program, createArgument } from "commander";
import { logInfo, logError, log } from "./helper.js";
import Pack from "./build.js";

function logOut(...args: any[]) {
  logError(args)
  process.exit(1);
}
program.version("1.0.0")
  .arguments("<entrypoint> [output].lua")
  .action((fp, outputPath) => {
    const filePath = path.resolve(fp);
    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory())
      logOut(`Could not find file "${path.parse(filePath).name}", did you forget the file extension?`);
    log("found file at " + path.resolve(filePath))

    const output = Pack(filePath);

    if (output && outputPath)
      fs.writeFileSync(path.resolve(outputPath), output);
    else {
      logError("No output file path was given, logging instead.")
      logInfo("Start of output")
      log(output);
      logInfo("End of output")

    }
  })
  .parse(process.argv);

if (!program.args.length) program.help();
