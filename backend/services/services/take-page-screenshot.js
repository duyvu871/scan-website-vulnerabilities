const hash = require("../helpers/hash");
const path = require("path");
const fs = require("node:fs");
const {writeFile} = require("../helpers/file-exception");
const {app} = require("electron");
const databasePath = require("../../../layers/utils/databasePath");

/**
 * Take a screenshot of a webpage.
 * @param {string} url - The URL of the webpage.
 * @returns {Promise<[Error|null, null|string]>} - The screenshot buffer.
 */

async function takePageScreenShot(url) {
    try {
        const browser = require('./browser').browser();
        const browserless = await browser.createContext({ retry: 2 })
        const buffer = await browserless.screenshot(url);
        // await browser.close();
        const urlEncoded = hash.hashString(url, process.env.SECRET_KEY || 'adadasdadasd');
        const fileName = `screenshot_${urlEncoded}.png`;
        const filePath = path.join(app.getPath('userData'), "storages/screenshots",  fileName);
        console.log('File path:', filePath);
        await fs.promises.mkdir(path.join(app.getPath('userData'), "storages/screenshots"), {recursive: true});

        const [writeError] = await writeFile(filePath, new Uint8Array(buffer));
        if (writeError) {
            return [writeError, null];
        }
        // const staticFilePath = path.join('storages/screenshots', fileName);
        await browserless.destroyContext();
        await browser.close();
        return [null, filePath];
    } catch (e) {
        console.log(e)
        return [e, null];
    }
}

module.exports = takePageScreenShot;