import {TContinentCode} from "countries-list";

export type GetHeadersResponse = {
    headers: {
        responseStatusLine: string,
        requestHeaders: string[],
        responseHeaders: any[]
    }
}

export type ResponseHeaders = "checkHSTS"| "checkXFrameOptions"| "checkXContentTypeOptions"| "checkCSP"| "checkReferrerPolicy"| "checkXXSSProtection"| "checkSecureCookies";

export type HeaderSecureCheck = {
    headerChecks: {
        [key in ResponseHeaders]: {
            status: "missing"|"secure"|"insecure"|"present"|"error",
            message: string
            header: string | null
        }
    }
}

export type GetDNSInfoResponse = {
    ips: {
        family: number;
        ip: string[];
    }[],
    asn: {
        as_domain: string | null;
        as_name: string | null;
        asn: number | null;
        continent: string | null;
        continent_name: string | null;
        country: string | null;
        country_name: string | null;
    } | null,
    geo: {
        country: TContinentCode;
        city: string| null;
        region1: string| null;
        region1_name: string| null;
        region2: string| null;
        region2_name: string| null;
        timezone: string| null;
        latitude: number| null;
        longitude: number| null;
        eu: boolean| null;
        area: string| null;
    } | null,
}

export interface CheckSSLResponse {
    results: {
        checkSSLExpiry: CheckSSLExpiry
        checkSSL: CheckSSL
    }
}

export interface CheckSSLExpiry {
    daysRemaining: number
    valid: boolean
    validFrom: string
    validTo: string
}

export interface CheckSSL {
    certInfo: CertInfo
}

export interface CertInfo {
    issuer: SSLIssuer
    serial: string
    country: string
    state: string
    locality: string
    organization: string
    organizationUnit: string
    commonName: string
    emailAddress: string
    dc: string
    san: SubjectAlternativeName
    validity: SSLValidity
    signatureAlgorithm: string
    publicKeySize: string
    publicKeyAlgorithm: string
}

export interface SSLIssuer {
    country: string
    state: string
    locality: string
    organization: string
    organizationUnit: string
    commonName: string
    dc: string
}

export interface SubjectAlternativeName {
    dns: string[]
    ip: any[]
    email: any[]
}

export interface SSLValidity {
    start: number
    end: number
}

export interface ScanProgress {
    task: string,
    time: string,
    percent: string,
    remaining: string
    etc: string
}

export interface ScanResult {
    result: {
        hostname: string,
        ip: string,
        mac: string|null,
        openPorts: {
            method?: string,
            port?: number,
            protocol?: string,
            service?: string,
        }[],
        osNmap: string|null,
    }[]
}