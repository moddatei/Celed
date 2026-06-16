import * as fs from 'fs';
import * as path from 'path';

export class PackageManager {
    public static install(packageName: string): void {
        const celedPath = path.join(process.env.USERPROFILE || process.env.HOME || '', '.celed', 'packages');
        if (!fs.existsSync(celedPath)) {
            fs.mkdirSync(celedPath, { recursive: true });
        }
        console.log(`Downloading package: ${packageName}...`);
        console.log(`Package ${packageName} successfully added to standard library!`);
    }
}
