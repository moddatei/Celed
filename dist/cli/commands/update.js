"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeUpdate = executeUpdate;
const child_process_1 = require("child_process");
function executeUpdate() {
    console.log("Updating Celed engine from GitHub...");
    try {
        (0, child_process_1.execSync)('git pull origin main', { stdio: 'inherit' });
        (0, child_process_1.execSync)('npm run build', { stdio: 'inherit' });
        (0, child_process_1.execSync)('npm link', { stdio: 'inherit' });
        console.log("Update complete! Celed is running the latest version.");
    }
    catch (e) {
        console.error("Update failed:", e.message);
        process.exit(1);
    }
}
