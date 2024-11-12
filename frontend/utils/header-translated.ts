import {headerTranslations} from "src/global/contants/header-translated";

export function translateHeader(header: keyof typeof headerTranslations): {translated: string, usage: string}|undefined {
    return headerTranslations[header.toLowerCase() as keyof typeof headerTranslations];
}

export function transformHeaders(headers: string[]): {value: string, translated: string, usage: string}[] {
    return headers.map(header => {
        const index = header.indexOf(':');
        const key = header.slice(0, index);
        const value = header.slice(index + 1);
        const translated = translateHeader(key.trim() as keyof typeof headerTranslations);
        return {value: value.trim(), translated: translated?.translated || key.trim(), usage: translated?.usage || ""}
    })
}
