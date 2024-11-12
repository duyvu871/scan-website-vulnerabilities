import type { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import {Wrappalyzer} from "src/types/services/wrappalyzer";
import {CheckSSLResponse, GetDNSInfoResponse, GetHeadersResponse, HeaderSecureCheck} from "src/types/services/api";

// Interface to define the shape of the `api.v1` object
// This improves code clarity and type checking
interface ApiV1 {
    // ... Other methods for API v1 (products, ...)
    initScan: (url: string, callback?: (error: AxiosError|null, data: any) => void) => Promise<{
        clientId?: string; url?: string; timestamp?: number; status?:string; error?: string
    } | undefined>;
    getScanStatus: (clientId: string, callback?: (error: AxiosError|null, data: any) => void)
        => Promise<{ url: string; status: string; result: any; timestamp: number; error?: string} | undefined>
    getHeaders: (clientId: string, callback?: (error: AxiosError|null, data: any) => void)
        => Promise<(GetHeadersResponse & {error?: string}) | undefined>;
    getHeadersCheck: (clientId: string, callback?: (error: AxiosError|null, data: any) => void)
        => Promise<(HeaderSecureCheck & {error?: string}) | undefined>;
    getTechnologies: (clientId: string,  callback?: (error: AxiosError|null, data: any) => void)
        => Promise<Wrappalyzer & {error?: string} | undefined>;
    takeScreenshot: (clientId: string,  callback?: (error: AxiosError|null, data: any) => void)
        => Promise<{path?: string;} & {error?: string} | undefined>;
    abortDirBuster: (clientId: string,  callback?: (error: AxiosError|null, data: any) => void)
        => Promise<{message?: string;} & { error?: string} | undefined>;
    domainDirBuster: (clientId: string, callback?: (error: AxiosError|null, data: any) => void)
        => Promise<{clientId?: string;} & { error?: string} | undefined>;
    getDNSInfo: (clientId: string, callback?: (error: AxiosError|null, data: any) => void)
        => Promise<GetDNSInfoResponse & { error?: string} | undefined>;
    getSSLInfo: (clientId: string, callback?: (error: AxiosError|null, data: any) => void)
       => Promise<CheckSSLResponse & { error?: string} | undefined>;
}

// Fetch the API endpoint from environment variables
// Using NEXT_PUBLIC_API_BASE_URL makes the endpoint available client-side
// If not defined (e.g., running locally), defaults to 'http://localhost:3000'
const API_ENDPOINT = ""//process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// Create the Axios instance with the base URL
const apiAlternative = axios.create({
    baseURL: `${API_ENDPOINT}/api/v1`,
}) as  AxiosInstance & { v1: ApiV1 } ;

const apiTemplate = async <T>(
    api: AxiosInstance,
    path: string,
    data: any,
    options: {
        method: "post" | "get",
        configs: AxiosRequestConfig | undefined
    },
    callback?: (error: AxiosError|null, data: T | undefined) => void
) => {

    try {
        const response = await api[options.method]<T>(path, data, options.configs);
        if (callback) callback(null, response.data);
        return response;
        // @ts-ignore
    } catch (error: AxiosError | null) {
        if (callback) {
            callback(error, error?.response?.data);
            return error?.response;
        } else {
            throw error;
        }
    }
}

// Define methods for API version 1
apiAlternative.v1 = {
    initScan: async (url, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.initScan && await window.api.initScan(url) as {clientId?: string; url?: string; timestamp?: number; status?:string; error?: string} | undefined;
    },
    getTechnologies: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.getTechnologies && await window.api.getTechnologies(clientId) as Wrappalyzer & {error?: string} | undefined;
    },
    takeScreenshot: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.takeScreenshot && await window.api.takeScreenshot(clientId) as {path?: string;} & {error?: string} | undefined;
    },
    abortDirBuster: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        const response = await apiTemplate<{message?: string} & { error?: string} | undefined>(
            apiAlternative,
            `domain-dir-buster/${clientId}/abort`,
            {},
            { method: 'post',
                configs: {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
            },
            callback
        );
        return response?.data;
    },
    domainDirBuster: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        const response = await apiTemplate<{clientId?: string} & { error?: string} | undefined>(
            apiAlternative,
            `/domain-dir-buster`,
            {
                clientId
            },
            { method: 'post',
                configs: {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
            },
            callback
        );
        return response?.data;
    },
    getDNSInfo: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.getDNSInfo && await window.api.getDNSInfo(clientId) as GetDNSInfoResponse & { error?: string} | undefined;
    },
    getSSLInfo: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.checkSSL && await window.api.checkSSL(clientId) as CheckSSLResponse & { error?: string} | undefined;
    },
    getScanStatus: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.getScanStatus && await window.api.getScanStatus(clientId) as
            ({ url: string; status: string; result: any; timestamp: number; error?: string}) | undefined;
    },
    getHeaders: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.getHeaders && await window.api.getHeaders(clientId) as (GetHeadersResponse & {error?: string}) | undefined;
    },
    getHeadersCheck: async (clientId, callback?: (error: AxiosError|null, data: any) => void) => {
        return window.api.checkHeaders && await window.api.checkHeaders(clientId) as (HeaderSecureCheck & {error?: string}) | undefined;
    },
};

export default apiAlternative;