import path from "path";
import {app} from "electron/main";

export const staticPath = {
    screenshot: path.join(app.getPath('userData'), "storages/screenshots"),
    logs: path.join(app.getPath('userData'), "storages/logs"),
}
