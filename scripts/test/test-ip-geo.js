const ipGeo = require('../../backend/services/services/ip-geo')

async function testGetIPInfo() {
    const ip = '118.69.84.237';
    const ipLocation = await ipGeo.getIPInfo(ip);
    console.log('ipLocation', ipLocation);
}

testGetIPInfo()