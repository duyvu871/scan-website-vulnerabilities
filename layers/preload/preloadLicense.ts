import {contextBridge, ipcRenderer, IpcRendererEvent} from "electron";

const licenseHandler = {
    checkLicense(license: string, primaryKey: string): Promise<boolean> {
        console.log("license", JSON.stringify({license, primaryKey}));
        return ipcRenderer.invoke("license", String(JSON.stringify({license, primaryKey})));
    },
    startTrial(): Promise<boolean> {
        return ipcRenderer.invoke("startTrial", true);
    },
    licenseInfo(): Promise<any> {
        return ipcRenderer.invoke("licenseInfo", true);
    }
};

contextBridge.exposeInMainWorld('license', licenseHandler);
