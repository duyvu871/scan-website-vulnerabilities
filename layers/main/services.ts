import validation from "../../backend/services/services/validation";
import dnsService from "../../backend/services/services/dns"
import {URL} from "url";
import {v4 as uuidv4} from "uuid";
import { HeadersScan } from "../database";
import ipGeoService from "../../backend/services/services/ip-geo";
import getTechnologies from "../../backend/services/services/get-technologies";
import takePageScreenShot from "../../backend/services/services/take-page-screenshot";
import headerChecks from "../../backend/services/services/header-secure-check-message";
import {getHeaders} from "../../backend/services/services/header-secure-check";
import ssl from "../../backend/services/services/get-ssl-certificate";
import checkSSLExpiry from "../../backend/services/services/ssl-checker";
// @ts-ignore
import checkSSLCert from "ssl-validator";

type ASNInfo = Partial<{
    as_domain: string;
    as_name: string;
    asn: string;
    continent: string;
    continent_name: string;
    country: string;
    country_name: string
}>

export type Wrappalyzer = Technology[]

export interface Technology {
    name: string
    description: string
    slug: string
    categories: Category[]
    confidence: number
    version: string
    icon: string
    website: string
    pricing: any[]
    cpe?: string
}

export interface Category {
    id: number
    slug: string
    groups: number[]
    name: string
    priority: number
}

type HeadersCheckAction = keyof typeof headerChecks;

export async function initScan(url: string) {
    if (!validation.isValidUrl(url))
        return {
            error: "URL không hợp lệ",
        }
    const urlEntity = new URL(url);
    const domain = urlEntity.hostname;
    const isDomainExists = await dnsService.checkDomainExists(domain);
    if (!isDomainExists)
        return {
            error: "Tên miền, ip không tìm thấy",
        }
    const clientId = uuidv4();

    const createdData = {
        url: url,
        clientId: clientId,
        status: "pending",
        timestamp: Date.now(),
    }
    const createScanSession = await HeadersScan.create(createdData);
    if (!createScanSession)
        return {
            error: "Không thể tạo phiên quét",
        }
    return createdData;
}

export async function scanStatus(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return {error: "Không tìm thấy phiên quét"};
    return scanSession.toJSON();
}

export async function dnsDetails(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return {error: "Không tìm thấy phiên quét"};
    if (scanSession.ips && scanSession.ips?.length) {
        try {
            const asn = scanSession.asn && scanSession.asn.country
                ? scanSession.asn : await ipGeoService.getASNInfo(scanSession.ips[0].ip?.[0]) as ASNInfo;
            const geo = scanSession.geo && scanSession.geo.country
                ? scanSession.geo : await ipGeoService.getIPInfo(scanSession.ips[0].ip?.[0]);

            if (!scanSession.asn || !scanSession.geo) {
                const update = await scanSession.update(
                    {ips: scanSession.ips, geo: geo, asn: asn,}
                );
                if (!update)
                    return {error: "Không thể cập nhật dữ liệu"};
            }
            return {
                ips: scanSession.ips,
                geo: geo,
                asn: asn,
            }
        } catch (error) {
            console.error(error);
            return {
                ips: scanSession.ips,
            }
        }
    }
    const url = scanSession.url;
    const URL = require("url").URL;
    try {
        const myURL = new URL(url);
        const domain = myURL.hostname;
        const ipInfo = {
            geo: {},
            asn: {},
        };
        const ips = [
            {
                ip: await dnsService.resolve4(domain),
                family: "v4",
            },
            {
                ip: await dnsService.resolve6(domain) || [],
                family: "v6",
            },
        ];
        if (!ips[0]?.ip?.length && !ips[1]?.ip?.length)
            return {error: "Không tìm thấy thông tin DNS"};
        if (ips[0].ip?.[0]) {
            await Promise.all([
                ipGeoService.getIPInfo(ips[0].ip[0]),
                ipGeoService.getASNInfo(ips[0].ip[0]),
            ]).then(([geo, asn]) => {
                Object.assign(ipInfo, {
                    geo: geo,
                    asn: asn,
                });
            });
        }
        // console.logs(ipInfo)
        const update = await scanSession.update(
            { ips: ips, geo: ipInfo.geo, asn: ipInfo.asn }
        );
        if (!update)
            return { error: "Không thể cập nhật dữ liệu" };
        console.log('ipinfo', {
            ips: ips,
            geo: ipInfo.geo,
            asn: ipInfo.asn,
        })
        return {
            ips: ips,
            geo: ipInfo.geo,
            asn: ipInfo.asn,
        };
    } catch (e) {
        console.log(e);
        return { error: "Không thể lấy thông tin DNS" };
    }
}

export async function technologies(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return { error: "Không tìm thấy phiên quét" };
    if (scanSession.technology) return JSON.parse(scanSession.technology);
    const url = scanSession.url;
    const technologies = await getTechnologies(url) as Wrappalyzer;
    const update = await scanSession.update(
        { technology: JSON.stringify(technologies) }
    );
    if (!update)
        return { error: "Không thể cập nhật dữ liệu" };
    if (technologies) return technologies;
    return { error: "Không thể phân tích công nghệ sử dụng trong trang" };
}

export async function takeScreenshot(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return { error: "Không tìm thấy phiên quét" };
    if (scanSession.screenshot)
        return {path: scanSession.screenshot};
    const url = scanSession.url;
    const [err, staticFilePath] = await takePageScreenShot(url);
    if (err) {
        console.error(err);
        return { error: `Không thể lấy ảnh chụp cho trang ${scanSession.url} ${err}` };
    }
    const update = await scanSession.update(
        { screenshot: staticFilePath }
    );
    if (!update)
        return { error: "Không thể cập nhật dữ liệu" };
    return {path: staticFilePath}
}

export async function checkHeaders(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return { error: "Không tìm thấy phiên quét" };
    if (scanSession.headerChecks)
        return {
            headerChecks: JSON.parse(scanSession.headerChecks),
        };
    const url = scanSession.url;

    try {
        const results: Promise<{status: string; header: string|null, message: string|null}>[] = [];
        const names: string[] = [];
        for (const checkName in headerChecks) {
            names.push(checkName);
            results.push(headerChecks[checkName as HeadersCheckAction](url));
        }
        const allResults = await Promise.all(results);
        const responseResults = allResults.reduce((acc, cur, index) => {
            return {
                ...acc,
                [names[index]]: cur,
            };
        }, {});
        const update = await scanSession.update(
            { headerChecks: JSON.stringify(responseResults) }
        );
        if (!update)
            return { error: "Không thể cập nhật dữ liệu" };

        return {
            headerChecks: responseResults,
        };
    } catch (error) {
        console.error(error);
        return { error: "Không thể kiểm tra header" };
    }
}

export async function headers(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return { error: "Không tìm thấy phiên quét" };
    if (scanSession.headers)
        return {
            headers: JSON.parse(scanSession.headers),
        };

    const url = scanSession.url;
    try {
        const headers = await getHeaders(url);

        const update = await scanSession.update(
            { headers: JSON.stringify(headers) }
        );
        if (!update)
            return { error: "Không thể cập nhật dữ liệu" };
        return { headers: headers };
    } catch (error) {
        console.error(error);
        return { error: "Không thể lấy thông tin header" };
    }
}

export async function checkSSLCertificate(clientId: string) {
    const scanSession = await HeadersScan.findByPk(clientId);
    if (!scanSession)
        return { error: "Không tìm thấy phiên quét" };
    const url = scanSession.url;
    try {
        const myURL = new URL(url);
        const domain = myURL.hostname;
        const sslExpiry = await checkSSLExpiry(domain);
        console.log(sslExpiry)
        // @ts-ignore
        const keyPem = (await ssl.get(domain, 10000))?.pemEncoded;

        const checkSSL = await checkSSLCert.validateSSL(keyPem);
        const results = {
            checkSSLExpiry: sslExpiry,
            checkSSL,
        };
        if (!results) return { error: "Không thể kiểm tra SSL" };
        return {results};
    } catch (error) {
        console.error(error);
        return { error: "Không thể kiểm tra SSL" };
    }
}

const services = {
    initScan: initScan,
    getDNSInfo: dnsDetails,
    getScanStatus: scanStatus,
    getTechnologies: technologies,
    takeScreenshot: takeScreenshot,
    checkHeaders: checkHeaders,
    getHeaders: headers,
    checkSSL: checkSSLCertificate,
}

export default services;

