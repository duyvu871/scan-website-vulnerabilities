import {contextBridge, ipcRenderer, IpcRendererEvent} from 'electron';
import os from 'os';
import {api, APIKey} from "../utils/api";
import {HeadersScan, HeadersScanCreationAttributes} from "../database";
import "./preloadLicense";

export type Channels = 'app:ready' | 'app:quit';

let safeAPI: Partial<Record<APIKey, (...args: any[]) => Promise<any>>> = {};
for (let key in api) {
    safeAPI[key as APIKey] = async (args) => {
        console.log(`Send IPC request: ${api[key as APIKey]} - ${args}`);
        return ipcRenderer.invoke(api[key as APIKey], args);
    };
}

const databaseAccess = {
    list: async (): Promise<HeadersScanCreationAttributes[]> => {
        return ipcRenderer.invoke('scan-list');
    }
}

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: Channels, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
                func(...args);
            ipcRenderer.on(channel, subscription);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        },
        once(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
    },
};


contextBridge.exposeInMainWorld('electron', {
    os: {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        type: os.type(),
        userInfo: os.userInfo(),
    },
});

contextBridge.exposeInMainWorld('ipcRenderer', electronHandler.ipcRenderer);

contextBridge.exposeInMainWorld('api', {
    ...safeAPI,
    databaseAccess,
});

contextBridge.exposeInMainWorld('websocket', {
    socketInfo: async (): Promise<{ port: number }> => {
        return ipcRenderer.invoke('socket-info');
    }
});

export type ElectronHandler = typeof electronHandler;
