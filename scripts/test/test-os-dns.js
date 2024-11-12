const dns = require('../../backend/services/services/dns');
const { resolveHostname, resolve4, resolve6 } = dns;

async function testResolveHostname() {
    const hostname = 'nextjs.org';
    const result = await resolveHostname(hostname, "A");
    console.log('hostname', result);
}

async function testResolve4() {
    const hostname = 'nextjs.org';
    const result = await resolve4(hostname);
    console.log('v4', result);
}

async function testResolve6() {
    const hostname = 'nextjs.org';
    const result = await resolve6(hostname);
    console.log('v6', result);
}

Promise.all([
    testResolveHostname(),
    testResolve4(),
    testResolve6(),
]).then(() => {
    console.log('All tests passed');
}).catch((error) => {
    console.error('At least one test failed:', error);
});