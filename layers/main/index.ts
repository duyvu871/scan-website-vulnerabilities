/**
 * Electron main process entry point.
 * This script is responsible for creating the main window,
 * handling IPC communication, and setting up the database.
 */

import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';

import {HeadersScan, sequelize} from '../database';
import {startNextJSServer} from '../utils/prepareNext';
import {api, APIKey} from '../utils/api';
import {validateObjectArg, validateStringArg, validationArgumentsInvoke} from '../utils/validation';

// Import security restrictions
import './security-restrictions';
// Import services
import services from './services';
import {isDev} from "../utils/env";
import {startSocketServer} from "./server";
import {Server, Socket} from "socket.io";
import {createSQLiteFile} from "../database/utils/sync";
import waitForTimeout from "../../backend/services/helpers/delay"
import {randomByRange} from "../utils/random";
import {createStoragePlace, npcapInstall, preInstallPackage} from "./preinstall";
import Store from "../utils/store";
import {
    checkLicenseKey,
    checkLicenseWhenStart, checkPrimaryKey,
    generateTrialLicenseKey,
    getLicenseKey, SECRET_KEY,
    storeLicenseKey,
    TRIAL_EXPIRED, verifyProductKey, verifyTrialKey
} from "./license";
import {decrypt} from "../utils/hash";
import { nativeTheme } from 'electron/main';


console.log('default appData: %s', app.getPath('appData'));
console.log('default app name: %s', app.getName());
console.log('default userData: %s', app.getPath('userData'));

let licenseStore: {
    key: string | null;
    type: 'trial' | 'product' | null;
    expiredAt: Date | null;
    expired: boolean;
} | null = null;
// Store the main window instance
let mainWindow: BrowserWindow | null = null;
let socketServer: { port: number; io: Server } | null = null;
let nextJSServer: { port: number } | null = null;
const mainWindowConfig = new Store({
    configName: 'user-preferences',
    defaults: {
        windowBounds: {
            width: 800,
            height: 600,
        },
    },
});
const packageStore = new Store<{
    executable: string;
    installed: boolean;
    serviceName: string;
}>({
    configName: 'package-info',
    defaults: {
        npcap: {
            executable: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/nmap-7.92/npcap-1.50.exe'),
            installed: false,
            serviceName: "npcap",
        },
        nmap: {
            executable: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/nmap-7.92/nmap.exe'),
            installed: true,
            serviceName: "nmap",
        },
        openssl: {
            executable: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/OpenSSL-Win64/bin/openssl'),
            installed: true,
            serviceName: "openssl",
        },
        chrome: {
            executable: path.join(isDev ? process.cwd() : process.resourcesPath, 'build-resources/packages/chrome-win64/chrome.exe'),
            installed: true,
            serviceName: "chrome",
        }
    },
});
createStoragePlace()

async function startNextApp() {
   try {
       if (isDev) {
           return 3000//await startNextJSServer(3000);
       } else {
           return await startNextJSServer();
       }
   } catch (e) {
       console.error("Error starting Next.js app:", e);
       return null;
   }
}

/**
 * Creates the main window of the application.
 *
 * @returns {BrowserWindow} - The main window.
 */
async function createMainWindow(): Promise<BrowserWindow> {
    const userPreferences = mainWindowConfig.get<{width: number;height: number}>('windowBounds');
    mainWindow = new BrowserWindow({
        title: 'Security Vulnerability Scanner', // Set window title
        width: userPreferences.width,
        height: userPreferences.height,
        minWidth: 900,
        minHeight: 700,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            // contextIsolation: false,
            webviewTag: false,
            preload: path.join(app.getAppPath(), 'dist/layers/preload/index.js'),
        },
    });

    if (!isDev) {
        mainWindow.webContents.on('before-input-event', (event, input) => {
            if (
                (input.control || input.meta) &&
                input.shift &&
                input.key.toLowerCase() === 'i'
            ) {
                event.preventDefault();
            }

            if (input.key === 'F12') {
                event.preventDefault();
            }
        });
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow?.webContents.closeDevTools();
        });

        mainWindow.removeMenu();
    }
    // Maximize window in development mode (optional)
    // isDev && mainWindow.maximize();
    // Handle window close event
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Handle window ready-to-show event
    mainWindow.on('ready-to-show', () => {
        mainWindow?.show();

        // Open DevTools in development mode
        if (isDev) {
            mainWindow?.webContents.openDevTools();
        }
    });
    // Load the appropriate URL based on development mode

    return mainWindow;
}

async function loadLicensePage() {
    return await new Promise(async (resolve, reject) => {

        await mainWindow?.loadFile(
            isDev ? path.join(app.getAppPath(), "assets/license.html")
                : path.join(process.resourcesPath, 'assets/license.html')
        )
    });
}

async function licenseValidateAction() {
    return await new Promise<void>(async (resolve, reject) => {
        if (!licenseStore?.expired && !licenseStore?.key && !licenseStore?.type) {
            const ok = await loadLicensePage();
            console.log('ok', ok);
            if (ok) {
                resolve();
            } else {
                app.quit();
            }
        }
    });
}

ipcMain.handle("license", validateObjectArg(
    async (_event, arg: string) => {
        console.log(`Received IPC request: license - ${arg}`);
        const {license, primaryKey} = JSON.parse(arg);
        console.log(`Received IPC request: license - ${license}`);
        const isValidPK = checkPrimaryKey(primaryKey);
        if (!isValidPK) {
            return {
                sec: null,
                message: "Mã khóa chính không hợp lệ",
            }
        }
        const isProduct = await verifyProductKey(license, primaryKey);
        if (isProduct) {
            await storeLicenseKey(license);
            // _event.sender.send("license-verified", {
            //     sec: {
            //         key: license,
            //         type: 'product',
            //         expiredAt: null,
            //         expired: false,
            //     },
            //     message: "Mã license của bạn đã được xác thực, vui lòng khởi động lại ứng dụng để sử dụng dịch vụ"
            // });
            // // resolve(true);
            return {
                sec: {
                    key: license,
                    type: 'product',
                    expiredAt: null,
                    expired: false,
                },
                message: "Mã license của bạn đã được xác thực, vui lòng khởi động lại ứng dụng để sử dụng dịch vụ"
            }
        } else {
            return {
                sec: null,
                message: "Mã license của bạn không hợp lệ",
            }
        }
    }
));
ipcMain.handle("startTrial", validateStringArg(
    async (_event, license: string) => {
        console.log(`Received IPC request: license - ${license}`);
        const storedLicenseKey = await getLicenseKey();
        if (storedLicenseKey) {
            const decrypted = await decrypt(storedLicenseKey, SECRET_KEY);

            const isTrial = await verifyTrialKey(storedLicenseKey);
            if (isTrial) {
                let isTrialValidate: boolean;
                const expiredDate = <string>decrypted?.replace('trial-', '');
                // Check if expiredDate is a number
                if (isNaN(parseInt(expiredDate))) {
                    isTrialValidate = false;
                } else {
                    isTrialValidate = new Date().getTime() < parseInt(expiredDate)
                }
                // Check if trial is expired
                if (isTrialValidate) {
                    // valid trial
                    return ({
                        sec: {
                            key: storedLicenseKey,
                            type: "trial",
                            expiredAt: new Date(parseInt(expiredDate)),
                            expired: false
                        },
                        message: "Mã dùng thử của bạn đang còn hiệu lực"
                    })
                } else {
                    // expired trial
                    return ({
                        sec: {
                            key: storedLicenseKey,
                            type: "trial",
                            expiredAt: new Date(parseInt(expiredDate)),
                            expired: true
                        },
                        message: "Mã dùng thử của bạn đã hết hạn, vui lòng sử dụng mã của nhà cung cấp"
                    })
                }
            }
            return {
                sec: null,
                message: "Bạn đã có mã license, không thể tạo mã dùng thử mới",
            }
        }
        const trialKey = await generateTrialLicenseKey();
        console.log('trialKey', trialKey);

        const stored = await storeLicenseKey(trialKey);
        if (stored) {
            return {
                sec: {
                    key: trialKey,
                    type: 'trial',
                    expiredAt: new Date(Date.now() + TRIAL_EXPIRED),
                    expired: false,
                },
                message: "Mã dùng thử đã được tạo, bạn có thời hạn 10 ngày trước khi hết hạn, hãy thoát ứng dụng và khởi động lại"
            };
        } else {
            return {
                sec: null,
                message: "Mã dùng thử của bạn chưa được lưu, vui lòng thử lại sau",
            }
        }
    }
));
ipcMain.handle("licenseInfo", validateStringArg(
    async (_event, _: boolean) => {
        console.log(`Received IPC request: licenseInfo - ${_}`);
        return licenseStore;
    }
));

const boostrap = async () => {
    await checkLicenseWhenStart((license) => {
        console.log('license', license);
        licenseStore = license;
    })
    console.log('license', !licenseStore?.expiredAt && !licenseStore?.key && !licenseStore?.type, licenseStore);
    // Create the main window
    mainWindow = await createMainWindow();
    if (licenseStore?.expired || (!licenseStore?.expiredAt && !licenseStore?.key && !licenseStore?.type)) {
        await mainWindow?.loadFile(
            isDev ? path.join(app.getAppPath(), "assets/license.html")
                : path.join(process.resourcesPath, 'assets/license.html')
        )
    } else if (!licenseStore?.expired && licenseStore?.expiredAt && licenseStore?.key && licenseStore?.type) {
        await mainWindow?.loadFile(
            isDev ? path.join(app.getAppPath(), "assets/preload.html")
                : path.join(process.resourcesPath, 'assets/preload.html'));
        await createSQLiteFile().then(async r => {
            if (!r.success) {
                console.error(r.message);
                app.quit();
            }
            // Start Next.js server

            // Start Socket server
            socketServer = await startSocketServer();
            const setupNamespace = socketServer.io.of("/setup");
            setupNamespace.on("connection", (socket: Socket) => {
                console.log("Client connected to /setup namespace");
                socket.on("disconnect", () => {
                    console.log("Client disconnected from /setup namespace");
                });
            });

            const portableNextJSServer = await startNextApp();
            if (portableNextJSServer) {
                nextJSServer = { port: portableNextJSServer };
                console.log(`Next.js server started on port ${nextJSServer.port}`);
            }

            // Synchronize database
            await sequelize
                .sync({
                    // Optional logging configuration
                    logging: (sql, timing) => {
                        // console.log('SQL:', sql);
                        // console.log('TIMING:', timing);
                    },
                    // Enable automatic database schema updates
                    alter: {
                        drop: false,
                    },
                    // Force database reset in development mode (use with caution!)
                    // ...(isDev ? { force: true } : {}),
                })
                .then(() => {
                    console.log('Database synced');
                    setupNamespace.emit("database-synced", { message: "Database synced" });
                });

        });
        await waitForTimeout(randomByRange(3000, 5000));
        await preInstallPackage(packageStore).then(async _ => {
            await waitForTimeout(randomByRange(7000, 10000));
            if (mainWindow)
                await mainWindow.loadURL(`http://localhost:${nextJSServer?.port}`);
        });

        // Register IPC handlers for each service
        for (const key in services) {
            ipcMain.handle(
                // IPC channel name
                api[key as APIKey],
                // Input validation middleware
                validateObjectArg(
                    // Service handler
                    async (_event, arg) => {
                        console.log(`Received IPC request: ${api[key as APIKey]} - ${arg}`);
                        if (!['initScan', 'getScanStatus'].includes(key)) await waitForTimeout(randomByRange(3000, 5000));
                        return await services[key as APIKey](arg);
                    }
                )
            );
        }

        ipcMain.handle("socket-info", async (event, arg) => {
            console.log(`Received IPC request: socket-info - ${arg}`);
            if (socketServer) {
                return { port: socketServer.port };
            } else {
                return null;
            }
        });
        ipcMain.handle("scan-list", async (event, arg) => {
            try {
                const list = await HeadersScan.findAll({
                    order: [['timestamp', 'DESC']],
                    limit: 100,
                });
                return list.map((scan) => scan.toJSON());
            } catch (error) {
                console.error("Error getting scan list:", error);
                return [];
            }
        });
    }
}

// Ensure only one instance of the application is running
const isSingleInstances = app.requestSingleInstanceLock();

if (!isSingleInstances) {
    // If not the first instance, quit
    app.quit();
} else {
    nativeTheme.themeSource = 'dark';
    if (!isDev) {
        app.commandLine.appendSwitch('disable-devtools');
    }
    // Handle second instance events
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // If a second instance is launched, focus on the existing window
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    // When Electron is ready
    app.whenReady()
        .then(async () => {
            boostrap();
            // Handle app activation (e.g., clicking on the dock icon)
            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
            });
        })
        .catch((e) => console.error('Failed to create window:', e));
    ipcMain.on("ping", () => console.log("pong"));
    // Quit the app when all windows are closed (except on macOS)
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
}