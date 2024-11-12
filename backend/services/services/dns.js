const dns = require('os-dns-native');

const familyMap = {
    "A": "v4",
    "AAAA": "v6"
}

/**
 * Resolves a hostname to an IP address.
 *
 * @param {string} hostname - The hostname to resolve.
 * @param option
 * @returns {Promise<{address: string, family: string} | null>} The IP address or null if an error occurs.
 */
async function resolveHostname(hostname, option = "A") {
    return new Promise((resolve, reject) => {
        dns.resolve(hostname, option, (err, address, family) => {
            if (err) {
                console.error(`DNS resolution error for ${hostname}:`, err);
                resolve(null);
            } else {
                resolve({ address, family: familyMap[option] });
            }
        });
    });
}

/**
 * Resolves a hostname to a list of IPv4 addresses.
 *
 * @param {string} hostname - The hostname to resolve.
 * @param {object} [options] - Options for `dns.resolve4`.
 * @returns {Promise<string[] | null>} A list of IPv4 addresses or null if an error occurs.
 */
async function resolve4(hostname, options = {}) {
    return new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
            if (err) {
                console.error(`DNS resolution error for ${hostname}:`, err);
                resolve(null);
            } else {
                resolve(addresses);
            }
        });
    });
}

/**
 * Resolves a hostname to a list of IPv6 addresses.
 *
 * @param {string} hostname - The hostname to resolve.
 * @param {object} [options] - Options for `dns.resolve6`.
 * @returns {Promise<string[] | null>} A list of IPv6 addresses or null if an error occurs.
 */
async function resolve6(hostname, options = {}) {
    return new Promise((resolve, reject) => {
        dns.resolve6(hostname, (err, addresses) => {
            if (err) {
                console.error(`DNS resolution error for ${hostname}:`, err);
                resolve(null);
            } else {
                resolve(addresses);
            }
        });
    });
}

/**
 * Resolves a hostname to a list of CNAME records.
 * @param {string} hostname - The hostname to resolve.
 * @param {object} [options] - Options for `dns.resolveCname`.
 * @returns {Promise<string[]|null>} A list of CNAME records or null if an error occurs.
 */
async function resolveCname(hostname, options = {}) {
    return new Promise((resolve, reject) => {
        dns.resolveCname(hostname, (err, addresses) => {
            if (err) {
                console.error(`DNS resolution error for ${hostname}:`, err);
                resolve(null);
            } else {
                resolve(addresses);
            }
        });
    });
}

/**
 * Resolves a hostname to a list of any records.
 * @param {string} hostname - The hostname to resolve.
 * @param {object} [options] - Options for `dns.resolveAny`.
 * @returns {Promise<any[]|null>} A list of any records or null if an error occurs.
 */
async function resolveAny(hostname, options = {}) {
    return new Promise((resolve, reject) => {
        dns.resolveAny(hostname, (err, addresses) => {
            if (err) {
                console.error(`DNS resolution error for ${hostname}:`, err);
                resolve(null);
            } else {
                resolve(addresses);
            }
        });
    });
}

/**
 * Checks if a domain exists.
 * @param {string} domain - The domain to check.
 * @returns {Promise<boolean>} True if the domain exists, false otherwise.
 */
async function checkDomainExists(domain) {
    try {
        await resolveHostname(domain);
        return true;
    } catch (error) {
        console.log(`Error checking domain ${domain}:`, error);

        if (error.code === 'ENOTFOUND') {
            return false;
        }
        return false;
    }
}

async function test() {
    console.log(await resolveHostname('connectedbrain.com.vn'));
    // console.logs(await resolve4('google.com'));
    // console.logs(await resolve6('google.com'));
    // console.logs(await resolveCname('google.com'));
    // console.logs(await resolveAny('connectedbrain.com.vn'));
}
// test()

module.exports = {
    checkDomainExists,
    resolveHostname,
    resolve4,
    resolve6,
    resolveCname,
    resolveAny
};