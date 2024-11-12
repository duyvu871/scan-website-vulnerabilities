const fs = require('fs');
const path = require('path');

async function copyDirectory(source, destination) {
    try {
        await fs.promises.mkdir(destination, { recursive: true });
        const files = await fs.promises.readdir(source);

        for (const file of files) {
            const current = path.join(source, file);
            const destinationFile = path.join(destination, file);
            const stat = await fs.promises.stat(current);

            if (stat.isDirectory()) {
                await copyDirectory(current, destinationFile);
            } else {
                await fs.promises.copyFile(current, destinationFile);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function setup() {
    const staticPath = path.join(process.cwd(), 'frontend/.next/static');
    const staticDestinationPath = path.join(process.cwd(), 'frontend/.next/standalone/frontend/.next/static');
    const publicPath = path.join(process.cwd(), 'public');
    const publicDestinationPath = path.join(process.cwd(), 'frontend/.next/standalone/frontend/public');
    await copyDirectory(staticPath, staticDestinationPath);
    await copyDirectory(publicPath, publicDestinationPath);
}

setup();