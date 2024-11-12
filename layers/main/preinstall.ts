import {packagePath} from "../utils/packagePath";
import {exec} from "child_process";
import logger from "electron-log";
import {app} from "electron";
import path from "path";
import fs from "fs";
import Store from "../utils/store";

type PackageStore = Record<string, {
    executable: string;
    installed: boolean;
    serviceName: string;
}>

export const execPromise = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.log(`error: ${error.message}`);
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}

export async function npcapInstall() {
    const npcapExecuablePath = packagePath.npcap;
    return execPromise("${npcapExecuablePath}");
}

export async function executableInstalled(executablePath: string) {
    try {
        return await execPromise(`"${executablePath}"`);
    } catch (e) {
        logger.log("Error checking executable:", e);
        return false;
    }
}

export function createStoragePlace() {
    const storageTemplate = [
        "storages",
        "storages/dirbuster",
        "storages/logs",
        "storages/screenshots",
    ]
    const appPath = app.getPath("userData");
    storageTemplate.forEach((dir) => {
        const dirPath = path.join(appPath, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
            logger.log(`Created directory: ${dirPath}`);
        } else {
            logger.log(`Directory already exists: ${dirPath}`);
        }
    });
}

export async function checkInstalledPackage(packageName: string): Promise<[err: string|null, sdtout: string|null]> {
    try {
        const stdout = await execPromise(`sc query ${packageName}`);
        return [null, stdout];
    } catch (e: any) {
        logger.log("Error checking installed package:", e);
        return [e.message, null];
    }
}

export async function preInstallPackage(store: Store<PackageStore[string]>) {
    const packageState = store.get_all();
    const packageKeys = Object.keys(packageState);
    const packageInstallFailed = [];
    try {
        for (const key of packageKeys) {
            const packageInfo = packageState[key];
            if (!packageInfo.installed) {
                const [err, stdout] = await checkInstalledPackage(packageInfo.serviceName || key);
                if (err) {
                    packageInstallFailed.push(key);
                    logger.log(`Failed to check package: ${key}`);
                    const installStatus = await executableInstalled(packageInfo.executable);
                    packageState[key].installed = true;
                    store.set(key, packageInfo);
                }
            }
        }
        return true;
    } catch (e) {
        logger.log("Error checking installed packages:", e);
        return false;
    }
}

// export