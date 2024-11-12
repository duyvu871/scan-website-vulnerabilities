import path from "path";
import logger from "electron-log"
import {app} from "electron";
import {isDev} from "./env";

const packagePath = {
    nmap: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/nmap-7.92/nmap.exe'),
    npcap: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/nmap-7.92/npcap-1.50.exe'),
    openssl: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/OpenSSL-Win64/bin/openssl'),
    chromeExecutable: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/chrome-win64/chrome.exe'),
}

logger.log('packagePath:', packagePath);

export {packagePath}