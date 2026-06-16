#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const run_1 = require("./commands/run");
const update_1 = require("./commands/update");
const build_1 = require("./commands/build");
const install_1 = require("./commands/install");
const args = process.argv.slice(2);
const command = args[0];
if (!command) {
    console.log("Usage: celed <command> [arguments]");
    console.log("Commands:");
    console.log("  run <file>      Interpret a Celed script");
    console.log("  build <file>    Compile a Celed script to native binary");
    console.log("  install <pkg>   Install a Celed package");
    console.log("  update          Update the Celed engine");
    process.exit(1);
}
switch (command) {
    case "run":
        if (!args[1]) {
            console.error("Error: Missing filename");
            process.exit(1);
        }
        (0, run_1.executeRun)(args[1]).catch(console.error);
        break;
    case "build":
        if (!args[1]) {
            console.error("Error: Missing filename");
            process.exit(1);
        }
        (0, build_1.executeBuild)(args[1]);
        break;
    case "install":
        if (!args[1]) {
            console.error("Error: Missing package name");
            process.exit(1);
        }
        (0, install_1.executeInstall)(args[1]);
        break;
    case "update":
        (0, update_1.executeUpdate)();
        break;
    default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
}
