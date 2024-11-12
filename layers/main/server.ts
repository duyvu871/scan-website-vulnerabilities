import { getPort } from 'get-port-please';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import helmet from 'helmet';
import Electron, {app} from 'electron';

import { HeadersScan } from '../database';
import { nmap } from '../../backend/services/services/nmap';
import { packagePath } from '../utils/packagePath';
import SqlInjection from '../../backend/services/services/database-injection/sql-injection';
import delay from '../../backend/services/helpers/delay';
import dnsService from "../../backend/services/services/dns";
import moment from "moment/moment";

/**
 * Starts the Socket.IO server for real-time communication.
 *
 * @returns {Promise<{ io: Server, port: number }>} - A promise that resolves with the Socket.IO server and its port.
 */
export async function startSocketServer(): Promise<{ io: Server; port: number }> {
    const app = express();

    // Middleware configuration
    app.use(cors({ origin: '*' }));
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.text());
    app.use(flash());
    app.use(helmet({ crossOriginResourcePolicy: false }));

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        },
        path: '/socket',
    });

    // Define namespaces for different features
    const nmapNamespace = io.of('/feature/nmap');
    const sqlInjectionNamespace = io.of('/feature/sql-injection');

    // Handle Nmap scan requests
    nmapNamespace.on('connection', (socket) => {
        console.log('a user connected to Nmap namespace');

        socket.on('start_nmap_scan', async (data) => {
            try {
                const parseData = JSON.parse(data);

                if (!parseData.clientId) {
                    socket.emit('error', { error: 'clientId is not provided' });
                    return;
                }

                const scanSession = await HeadersScan.findByPk(parseData.clientId);
                if (!scanSession) {
                    socket.emit('error', { error: 'clientId is not found' });
                    return;
                }

                const executedData = scanSession.toJSON();
                const url = new URL(executedData.url);
                let hostnameOrIp: string = url.hostname;
                // if (executedData.ips?.[0]?.ip?.length) {
                //     hostnameOrIp = executedData.ips[0].ip[0];
                // } else {
                //     const ips = await dnsService.resolve4(hostnameOrIp);
                //     if (ips?.length) {
                //         hostnameOrIp = ips[0];
                //     }
                // }
                // Configure and start Nmap scan
                console.log('Nmap Scan Data:', {
                    hostnameOrIp,
                })
                nmap.nmapLocation = packagePath.nmap;
                const quickScan = new nmap.NmapScan(
                    `${hostnameOrIp} --min-parallelism 50 --max-parallelism 200 -O -sV --script vulners --stats-every 1s`
                );

                //118.69.84.238 --min-parallelism 50 --max-parallelism 200  -T4 -A -Pn -sT -vv --stats-every 1s -O

                // Handle scan events
                quickScan.on('progress', (data: any) => {
                    socket.emit('progress', data);
                    console.log('scanProgress', data);
                });

                quickScan.on('complete', (data: any) => {
                    socket.emit('complete', data);
                    console.log('scanComplete', data);
                });

                quickScan.on('error', (error: any) => {
                    socket.emit('error', { error: `nmap Internal server error: ${error} \nnmap path: ${packagePath.nmap}` });

                    console.error('scanError', error);

                });

                quickScan.startScan();

                // Cancel scan on disconnect
                socket.on('disconnect', () => {
                    quickScan.cancelScan();
                });
            } catch (e) {
                console.error('nmap error', e);
                socket.emit('error', { error: `nmap Internal server error: ${e} \nnmap path: ${packagePath.nmap}` });
            }
        });
    });

    // Handle SQL injection scan requests
    sqlInjectionNamespace.on('connection', (socket) => {
        console.log('a user connected to SQL Injection namespace');

        socket.on('start_sql_injection_scan', async (data) => {
            try {
                // Parse and validate input data
                const dataParse = JSON.parse(data) as {
                    url: string;
                    method: string;
                    params: string;
                    body: string;
                    headers: string;
                    path: string;
                };
                const { url, method, params, body, headers: headersClient, path: pathClient } = dataParse;

                if (!url) {
                    socket.emit('error', { error: 'url is required' });
                    return;
                }

                // Prepare data for SQL injection scan
                const parsedParams = parseKeyValueString(params);
                const parsedBody = parseKeyValueString(body);
                const parsedHeaders = parseKeyValueString(headersClient);

                console.log('SQL Injection Scan Data:', {
                    url,
                    headers: parsedHeaders,
                    method: method || 'GET',
                    params: parsedParams,
                    body: parsedBody,
                });

                // Initialize and configure SQL injection scanner
                const logPath = path.join(Electron.app.getPath('userData'), 'storages/logs/sql_injection.log');
                const sqlInjection = new SqlInjection('client-id', {
                    url,
                    method: method || 'GET',
                    params: parsedParams,
                    body: parsedBody,
                }, logPath);
                sqlInjection.DELAY_BEFORE_NEXT_REQUEST = 20;
                // Handle scan events
                sqlInjection.event.on('sql-injection-error-based', (data) => {
                    const { query, response, time, progress, responseTime, requestTime } = data;
                    const { url, method, params, body, maliciousQuery } = query;
                    const { process, percent } = progress;
                    console.log(`[Request]:\n -time:${time}\n -${url}\n\ -${method}\n\ -${JSON.stringify(params)}\n -${JSON.stringify(body)}\n -${maliciousQuery}`);
                    console.log(`[Response]:\n -${response.message}\n -${maliciousQuery} `);
                    socket.emit('progress', {
                        detail: {
                            process,
                            percentage: percent,
                        },
                        request: `[Request:${moment(requestTime).format('h:mm:ss')}]: -time:${time} -${url} -${method} -${JSON.stringify(params)} -${JSON.stringify(body)}`,
                        response: `[Response:${moment(responseTime).format('h:mm:ss')}]: -${response.message} -${maliciousQuery}`,
                    });
                });

                const emitProgress = (message: string, detail: string) => {
                    socket.emit('progress', { request: message, response: detail });
                }

                sqlInjection.event.on('pre-fetch-headers', ({message}: {message: string}) => emitProgress(message, ''));
                sqlInjection.event.on('fetched-headers',
                    ({message, headers}: {message:string; headers: Record<string, string>}) =>
                        emitProgress(
                            message,
                            Object.keys(headers).map((key) => `\t${key}: ${headers[key]}`).join('\n')
                        )
                );
                sqlInjection.event.on('calculate-vulnerability', ({message}: {message: string}) =>
                    emitProgress(message, ''));
                sqlInjection.event.on('calculated-vulnerability', ({
                    message,
                    percentage,
                    pointMarked,
                    time} : {message: string; percentage: number; pointMarked: number; time: number}) =>
                        emitProgress(
                            message,
                            `Percentage: ${percentage}%, Point marked: ${pointMarked}, Time: ${time}`
                        )
                );
                // Perform SQL injection scans
                await sqlInjection.preFetchHeaders();
                await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/Generic_ErrorBased.txt'));
                await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/Generic_SQLI.txt'));

                // Perform additional scans in production mode
                // if (process.env.NODE_ENV === 'production') {
                    await delay(5000);
                    await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/Generic_TimeBased.txt'));
                    await delay(5000);
                    await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/Generic_UnionSelect.txt'));
                    await delay(5000);
                    await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/GenericBlind.txt'));
                    await delay(5000);
                    await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/payloads-sql-blind-MySQL-INSERT.txt'));
                    await delay(5000);
                    await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/payloads-sql-blind-MySQL-ORDER_BY.txt'));
                    await delay(5000);
                    await sqlInjection.scanWithDictionary(path.posix.join(Electron.app.getAppPath(), 'backend/services/services/database-injection/signature/sql/payloads-sql-blind-MySQL-WHERE.txt'));
                // }

                // Send scan results on completion
                const pointStorePath = path.join(Electron.app.getPath('userData'), 'storages/logs/sql_injection.json');
                sqlInjection.calculatedVulnerabilities(pointStorePath).then((res) => {
                    socket.emit('complete', res);
                });
            } catch (error) {
                console.error('sqlInjection error', error);
                socket.emit('error', { error: `sqlInjection Internal server error: ${error}` });
            }
        });
    });

    // Start the server
    const port = await getPort({ portRange: [30_011, 50_000] });
    server.listen(port, () => {
        console.log(`Socket server started on port: ${port}`);
    });

    return { io, port };
}

/**
 * Parses a comma-separated key-value string into an object.
 *
 * @param {string} input - The comma-separated key-value string.
 * @returns {Record<string, string>} - The parsed key-value object.
 */
function parseKeyValueString(input: string): Record<string, string> {
    return (input || '')
        .split(',')
        .map((str) => str.trim())
        .reduce((acc, cur) => {
            const [key, value] = cur.split(':');
            return { ...acc, [key]: value };
        }, {});
}