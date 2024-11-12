const {app} = require("electron")
const ipLocation = require('ip-location-api');
const path = require('path');
const fs = require('fs');
const maxmind =  require('maxmind')
const {isDev} = require("../configs/env");

async function reloadConf() {
    return await ipLocation.reload({
        fields: 'all',
    })
}

async function getIPInfo(ip) {
    await reloadConf();
    const result = await ipLocation.lookup(ip);
    // console.logs(result);
    // ipLocation.watchDb();
    console.log(result);
    return result;
}

async function getASNInfo(ip) {
    const dbPath = path.posix.join(isDev ? process.cwd() : process.resourcesPath, 'assets/ip-geo/country_asn.mmdb');
    console.log(dbPath)
    const db = await maxmind.open(dbPath);
    const result = await db.get(ip);
    console.log(result);
    return result;
}

module.exports = {
    getASNInfo,
    reloadConf,
    getIPInfo
};