export const api = {
    initScan: "POST /api/v1/init-scan",
    getDNSInfo: "POST /api/v1/get-dns-info",
    getScanStatus: "POST /api/v1/get-scan-status",
    getTechnologies: "POST /api/v1/get-technologies",
    takeScreenshot: "POST /api/v1/take-screenshot",
    checkHeaders: "POST /api/v1/check-headers",
    getHeaders: "POST /api/v1/get-headers",
    checkSSL: "POST /api/v1/check-ssl",
};

export type API = typeof api;
export type APIKey = keyof API;