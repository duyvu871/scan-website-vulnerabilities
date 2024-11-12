import {atom} from 'jotai';
import {Wrappalyzer} from "src/types/services/wrappalyzer";
import {CheckSSLResponse, GetDNSInfoResponse, GetHeadersResponse, HeaderSecureCheck} from "src/types/services/api";

export const clientIdAtom = atom<string | null>(null);
export const clientStatusAtom = atom<{ url: string, status: string, result: any, timestamp: number} | null>(null);
export const technologiesAtom = atom<Wrappalyzer|null>(null);
export const screenshotAtom = atom<{path: string} | null>(null);
export const headersAtom = atom<GetHeadersResponse | null>(null);
export const headerCheckAtom = atom<HeaderSecureCheck | null>(null);
export const dnsInfoAtom = atom<GetDNSInfoResponse | null>(null);
export const sslReportAtom = atom<CheckSSLResponse | null>(null);
export const isTechnologiesLoadingAtom = atom<boolean>(false);
export const isScreenshotLoadingAtom = atom<boolean>(false);