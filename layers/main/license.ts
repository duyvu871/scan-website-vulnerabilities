import keytar from 'keytar'
import {TinhThanh} from "../configs/region";
import {isDev} from "../utils/env";
import {encrypt, decrypt} from "../utils/hash";

const SERVICE_NAME = 'scan-vulnerabilities-license';
const SALT_ROUNDS = 10;
export const TRIAL_EXPIRED = isDev ? 5 * 60 * 1000 : 10 * 24 * 60 * 60 * 1000; // 7 minutes
export const PRODUCT_EXPIRED = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SECRET_KEY = 'truongT07-2024-!@#$%^&*()';
const TRIAL_KEY = 'trial';
const PRIMARY_KEY = 'scan-vulnerabilities';
let TinhThanhLicense: Record<string, string> | null = null;

// generate trial license key
export async function generateTrialLicenseKey(): Promise<string> {
    const expiredDate = new Date();
    expiredDate.setTime(expiredDate.getTime() + TRIAL_EXPIRED);
    return await encrypt(`trial(separate)${expiredDate.getTime()}`, SECRET_KEY);
}
// generate license key
export async function generateLicenseKey(data: string): Promise<string> {
    return await encrypt(data, SECRET_KEY);
}
// generate license key for each province
export async function genTinhThanhLicense(primaryKey: string, expire?: number): Promise<Record<string, string>> {
    const keys = Object.keys(TinhThanh);
    const result: Record<string, string> = {};
    const hashProcessed: Promise<string>[] = [];
    const expiredDate = (new Date());
    expiredDate.setTime(expiredDate.getTime() + (expire || PRODUCT_EXPIRED));
    for (const maTinh of keys) {
        hashProcessed.push(generateLicenseKey(`${primaryKey}(separate)${maTinh}(separate)${expiredDate.getTime()}`));
    }
    const hashes = await Promise.all(hashProcessed);
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = hashes[i];
    }
    TinhThanhLicense = result;
    return result;
}
// verify license key
export async function verifyLicenseKey(data: string, encrypted: string): Promise<boolean> {
    const encryptedData = await encrypt(data, SECRET_KEY);
    return encrypted === encryptedData;
}
// verify trial key
export async function verifyTrialKey(licenseKey: string): Promise<boolean> {
    const decrypted = await decrypt(licenseKey, SECRET_KEY);
    console.log('decrypted', decrypted);
    return !!decrypted && decrypted.startsWith('trial(separate)');
}
// verify product key
export async function verifyProductKey(licenseKey: string, primaryKey: string): Promise<boolean> {
    const decrypted = await decrypt(licenseKey, SECRET_KEY);
    console.log('decrypted', decrypted);
    if (!decrypted) return false;
    const verifySignature =
        !!decrypted
        && decrypted.includes(primaryKey)
        && decrypted.split('(separate)').length === 3;

    console.log('true', !!decrypted);
    console.log('startsWith', decrypted.includes(primaryKey));
    console.log('split', decrypted.split('(separate)').length === 3);

    if (!verifySignature) {
        return false;
    }

    const [secret, matinh, expire] = decrypted.split('(separate)');

    // const tinhthanhLicense = TinhThanhLicense || await genTinhThanhLicense(SECRET_KEY);
    // if (!tinhthanhLicense[matinh]) return false;
    console.log('secret', secret);
    console.log('matinh', matinh);
    console.log('expire', expire);
    if (isNaN(parseInt(expire))) return false;
    const expiredDate = new Date(parseInt(expire));
    const expired = new Date().getTime() > expiredDate.getTime();
    return !expired;
}
// store license key
export async function storeLicenseKey(key: string): Promise<boolean> {
    try {
        // Store key to database
        console.log(`Storing license key: ${key}`);
        await keytar.setPassword(SERVICE_NAME, 'license', key);
        return true;
    } catch (e) {
        console.log('Failed to store license key:', e);
        return false
    }
}
// get license key
export async function getLicenseKey(): Promise<string | null> {
    return keytar.getPassword(SERVICE_NAME, 'license');
}
// delete license key
export async function deleteLicenseKey(): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, 'license');
}
// check license key
export async function checkLicenseKey(licenseKey: string): Promise<boolean> {
    const storedLicenseKey = await getLicenseKey();
    return !!storedLicenseKey && verifyLicenseKey(licenseKey, storedLicenseKey);
}

export function checkPrimaryKey(primaryKey: string): boolean {
    return primaryKey === SECRET_KEY;
}
// export async function storeAllLicenseKeys(primaryKey: string): Promise<void> {
//    const licenseKeys = await genTinhThanhLicense(primaryKey);
//     const keys = Object.keys(licenseKeys);
//     for (const key of keys) {
//         await keytar.setPassword(SERVICE_NAME, key, licenseKeys[key]);
//     }
// }

// check license key when start
export async function checkLicenseWhenStart(
    cb: (args: {
        key: string|null;
        expiredAt: Date|null;
        type: 'trial' | 'product' | null;
        expired: boolean;
    }) => any
): Promise<void> {
    const [storedLicenseKey, generatedLicenseKey] = await Promise.all([
        getLicenseKey(), genTinhThanhLicense(SECRET_KEY)
    ]);

    console.log('storedLicenseKey', storedLicenseKey);
    console.log('generatedLicenseKey', generatedLicenseKey);

    if (!storedLicenseKey) {
        return cb({
            key: null,
            expiredAt: null,
            type: null,
            expired: true
        });
    }
    const decrypted = await decrypt(storedLicenseKey, SECRET_KEY);
    // Check if license key is trial
    const isTrial = await verifyTrialKey(storedLicenseKey);
    if (isTrial) {
        let isTrialValidate: boolean;
        const expiredDate = <string>decrypted?.replace('trial(separate)', '');
        console.log('expiredDate', expiredDate);
        // Check if expiredDate is a number
        if (isNaN(parseInt(expiredDate))) {
            isTrialValidate = false;
        } else {
            isTrialValidate = new Date().getTime() < parseInt(expiredDate)
        }
        // Check if trial is expired
        if (isTrialValidate) {
            // valid trial
            return cb({
                key: storedLicenseKey,
                expiredAt: new Date(parseInt(expiredDate)),
                type: 'trial',
                expired: false
            });
        } else {
            // expired trial
            return cb({
                key: storedLicenseKey,
                expiredAt: new Date(parseInt(expiredDate)),
                type: "trial",
                expired: true
            });
        }
    }

    // Check if license key is product
    const isProduct = await verifyProductKey(storedLicenseKey, SECRET_KEY);
    console.log('isProduct', isProduct);
    if (isProduct) {
        let isProductValidate: boolean;
        const expiredDate = decrypted?.split('(separate)').pop();

        if (!expiredDate) {
            return cb({
                key: storedLicenseKey,
                expiredAt: null,
                type: null,
                expired: true
            });
        }

        // Check if expiredDate is a number
        if (isNaN(parseInt(expiredDate))) {
            isProductValidate = false;
        } else {
            isProductValidate = new Date().getTime() < parseInt(expiredDate)
        }

        if (isProductValidate) {
            // valid product
            return cb({
                key: storedLicenseKey,
                expiredAt: new Date(parseInt(expiredDate)),
                type: "product",
                expired: false
            });
        }

        return cb({
            key: storedLicenseKey,
            expiredAt: new Date(parseInt(expiredDate)),
            type: "product",
            expired: true
        });
    } else {
        return cb({
            key: null,
            expiredAt: null,
            type: null,
            expired: true
        });
    }
}
