import { execSync } from 'child_process';

export function executeUpdate(): void {
    console.log("Updating Celed engine from GitHub...");
    try {
        execSync('git pull origin main', { stdio: 'inherit' });
        execSync('npm run build', { stdio: 'inherit' });
        execSync('npm link', { stdio: 'inherit' });
        console.log("Update complete! Celed is running the latest version.");
    } catch (e: any) {
        console.error("Update failed:", e.message);
        process.exit(1);
    }
}
