#!/usr/bin/env node
import { executeRun } from './commands/run';
import { executeUpdate } from './commands/update';
import { executeBuild } from './commands/build';
import { executeInstall } from './commands/install';

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
        if (!args[1]) { console.error("Error: Missing filename"); process.exit(1); }
        executeRun(args[1]).catch(console.error);
        break;
    case "build":
        if (!args[1]) { console.error("Error: Missing filename"); process.exit(1); }
        executeBuild(args[1]);
        break;
    case "install":
        if (!args[1]) { console.error("Error: Missing package name"); process.exit(1); }
        executeInstall(args[1]);
        break;
    case "update":
        executeUpdate();
        break;
    default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
}
