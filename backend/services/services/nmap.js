const child_process = require('child_process');
const execSync = child_process.execSync;
const exec = child_process.exec;
const spawn = child_process.spawn;
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const xml2js = require('xml2js');

/**
 *
 * @param {*} xmlInput
 * @param {*} onFailure
 * @returns {host[]} - Array of hosts
 */
function convertRawJsonToScanResults(xmlInput) {
    let tempHostList = [];

    if (!xmlInput.nmaprun.host) {
        //onFailure("There was a problem with the supplied NMAP XML");
        return tempHostList;
    };

    xmlInput = xmlInput.nmaprun.host;

    tempHostList = xmlInput.map((host) => {
        console.log('host', JSON.stringify(host));
        const newHost = {
            hostname: null,
            ip: null,
            mac: null,
            openPorts: null,
            osNmap: null,
        }

        //Get hostname
        if (host.hostnames && host.hostnames[0] !== "\r\n" && host.hostnames[0] !== "\n") {
            newHost.hostname = host.hostnames[0].hostname[0].$.name
        }

        //Get addresses
        host.address.forEach((address) => {
            const addressType = address.$.addrtype
            const addressAdress = address.$.addr
            const addressVendor = address.$.vendor

            if (addressType === 'ipv4') {
                newHost.ip = addressAdress
            } else if (addressType === 'mac') {
                newHost.mac = addressAdress
                newHost.vendor = addressVendor
            }

        })

        //Get ports and vulnerabilities
        if (host.ports && host.ports[0].port) {
            const portList = host.ports[0].port

            const openPorts = portList.filter((port) => {
                return (port.state[0].$.state === 'open')
            })

            newHost.openPorts = openPorts.map((portItem) => {
                console.log('portItem', JSON.stringify(portItem));
                const port = parseInt(portItem.$.portid)
                const protocol = portItem.$.protocol;
                const service = portItem.service?.[0]?.$.name;
                const tunnel = portItem.service?.[0]?.$?.tunnel
                const method = portItem.service?.[0]?.$?.method
                const product = portItem.service?.[0]?.$?.tunnel

                // check for <script> tag on nmap output
                if (portItem.script) {
                    var scriptID = portItem.script[0].$.id
                    // console.logs(scriptID)
                    var scriptOutput = [];
                    for (var i = 0; i < portItem.script.length; i++) {
                        if (portItem.script[i].$.id === 'vulners') {
                            scriptID = portItem.script[i].$.id
                            //console.logs(portItem.script[i].$.output)

                            for (var j = 0; j < portItem.script[i].table.length; j++) {
                                for (var k = 0; k < portItem.script[i].table[j].table.length; k++) {
                                    for (var l = 0; l < portItem.script[i].table[j].table[k].elem.length; l++) {
                                        if (portItem.script[i].table[j].table[k].elem[l]._.startsWith("CVE")) {
                                            temp = portItem.script[i].table[j].table[k].elem[l]._;
                                            scriptOutput.push(temp)
                                        }

                                    }
                                }
                            }
                            /* uncomment to debug
                              console.logs("scriptID = " + scriptID)
                              console.logs("scriptOutput = " + scriptOutput)
                            */
                        }

                    }
                } else {
                    var scriptID = null
                    var scriptOutput = null
                }

                let portObject = {}
                if (port) portObject.port = port
                if (protocol) portObject.protocol = protocol
                if (service) portObject.service = service
                if (tunnel) portObject.tunnel = tunnel
                if (method) portObject.method = method
                if (product) portObject.product = product
                if (scriptID === 'vulners') {
                    portObject.vulners = scriptOutput
                }

                return portObject
            })
        }

        if (host.os && host.os[0].osmatch && host.os[0].osmatch[0].$.name) {
            newHost.osNmap = host.os[0].osmatch[0].$.name
        }
        return newHost
    })

    return tempHostList;
}


class NmapScan extends EventEmitter {
    constructor(range, inputArguments) {
        super();
        this.command = [];
        this.nmapoutputXML = "";
        this.timer;
        this.range = [];
        this.arguments = ['-oX', '-'];
        this.rawData = '';
        this.rawJSON;
        this.child;
        this.cancelled = false;
        this.scanTime = 0;
        this.error = null;
        this.scanResults;
        this.scanTimeout = 0;
        this.commandConstructor(range, inputArguments);
        this.initializeChildProcess();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.scanTime += 10;
            if (this.scanTime >= this.scanTimeout && this.scanTimeout !== 0) {
                this.killChild();
            }
        }, 10);
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    commandConstructor(range, additionalArguments) {
        if (additionalArguments) {
            if (!Array.isArray(additionalArguments)) {
                additionalArguments = additionalArguments.split(' ');
            }
            this.command = this.arguments.concat(additionalArguments);
        } else {
            this.command = this.arguments;
        }

        if (!Array.isArray(range)) {
            range = range.split(' ');
        }
        this.range = range;
        this.command = this.command.concat(this.range);
    }

    killChild() {
        this.cancelled = true;
        if (this.child) {
            this.child.kill();

        }
    }

    initializeChildProcess() {
        this.startTimer();
        this.child = spawn(nmap.nmapLocation, this.command);
        process.on('SIGINT', this.killChild);
        process.on('uncaughtException', this.killChild);
        process.on('exit', this.killChild);
        this.child.stdout.on("data", (data) => {
            if (data.indexOf("percent") > -1) {
                xml2js.parseString(data.toString(), (err, result) => {
                    if (err) {
                        this.emit('error', "Error converting XML to JSON in xml2js: " + err);
                    } else {
                        this.emit('progress', result.taskprogress.$);
                    }
                });
                // console.logs(data.toString());
            } else {
                this.rawData += data;
            }

        });

        this.child.on('error', (err) => {
            this.killChild();
            if (err.code === 'ENOENT') {
                this.emit('error', 'NMAP not found at command location: ' + nmap.nmapLocation)
            } else {
                this.emit('error', err.Error)
            }
        })

        this.child.stderr.on("data", (err) => {
            this.error = err.toString();
        });

        this.child.on("close", () => {
            process.removeListener('SIGINT', this.killChild);
            process.removeListener('uncaughtException', this.killChild);
            process.removeListener('exit', this.killChild);

            if (this.error) {
                this.emit('error', this.error);
            } else if (this.cancelled === true) {
                this.emit('error', "Over scan timeout " + this.scanTimeout);
            } else {
                this.rawDataHandler(this.rawData);
            }
        });
    }

    startScan() {
        this.child.stdin.end();
    }

    cancelScan() {
        this.killChild();
        this.emit('error', "Scan cancelled");
    }

    scanComplete(results) {
        this.scanResults = results;
        this.stopTimer();
        this.emit('complete', this.scanResults);
    }

    rawDataHandler(data) {
        let results;
        //turn NMAP's xml output into a json object
        xml2js.parseString(data, (err, result) => {
            if (err) {
                this.emit('error', "Error converting XML to JSON in xml2js: " + err);
            } else {
                this.rawJSON = result;
                results = convertRawJsonToScanResults(this.rawJSON, (err) => {
                    this.emit('error', "Error converting raw json to cleans can results: " + err + ": " + this.rawJSON);
                });
                this.scanComplete(results);
            }
        });
    }
}

let nmap = {
    nmapLocation: "nmap",
    NmapScan
}

// const nmapscan = new nmap.NmapScan('connectedbrain.com.vn -O -sV --script vulners');
//
// nmapscan.on('complete',function(data){
//     console.logs(data);
//     fs.writeFile('output.json', JSON.stringify(data), function(err){
//         if(err){
//             console.logs(err);
//         }
//     });
// });
// nmapscan.on('error', function(error){
//     console.logs(error);
// });
//
// nmapscan.startScan();

/**
 * @param {string} domain
 * @returns {Promise<any>}
 */
async function nmapScan(domain){
   console.log(domain);
   return new Promise((resolve, reject) => {
       nmap.nmapLocation = "nmap"; //default
       let quickscan = new nmap.NmapScan(`${domain} -Pn -vv --stats-every 1s -O -sV `);
       quickscan.on('complete', function(data) {
           resolve(data);
           // console.logs(data);
       });
       quickscan.on('error', function(error){
           reject(null);
           console.log(error);
       });
       quickscan.on('progress', (data) => {
           console.log('scanProgress', data);
       });
       quickscan.startScan();
   });
}
 // nmapScan('example.com').then((data) => {
 //     console.logs(data);
 // }).catch((err) => {
 //     console.logs(err);
 // });

module.exports = {
    nmap,
    nmapScan
};