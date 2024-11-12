const { HeadersScan } = require('../../dist/database');

const testDb = async () => {
    await HeadersScan.sync({force: true});
    const headers = new HeadersScan({
        clientId: 'test',
        url: 'https://test.com',
        ips: [
            {
                ip: ['127.0.0.1'],
                family: 'IPv4',
            }
        ],
        geo: {
            country: 'test',
            city: 'test',
            region1: 'test',
            region1_name: 'test',
            region2: 'test',
            region2_name: 'test',
            timezone: 'test',
            latitude: 0,
            longitude: 0,
            eu: 0,
            area: 0,
        },
        asn: {
            as_domain: 'test',
            as_name: 'test',
            asn: 'test',
            continent: 'test',
            continent_name: 'test',
            country: 'test',
            country_name: 'test',
        },
        status: 'test',
        timestamp: 0,
        technology: 'test',
        headers: 'test',
        nmap: 'test',
        headerChecks: {},
        screenshot: 'test',
        dirBuster: 'test',
    });

    await headers.save();
    console.log('Headers saved');

    const headersList = await HeadersScan.findByPk('test');
    console.log('Headers list:', headersList.toJSON());
}

testDb()