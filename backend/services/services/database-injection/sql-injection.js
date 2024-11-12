const signature = require('./signature/sql');
const axios = require('axios');
const CreateBrowser = require('browserless');
const fs = require("node:fs");
const path = require("node:path");
const EventEmitter = require('events').EventEmitter;
const { performance } = require('perf_hooks');
const timeout = require("../../helpers/delay");

class SqlInjection {
    clientId = null;
    options = {
        url: null, // request url: https://example.com/api/v1/users
        method: null, // GET, POST, PUT, DELETE
        params: null, // query params: ?q=1&page=2
        body: null, // request body: {username: 'admin', list: [1, 2, 3]}
    };
    headers = {};
    cookies = [];
    USER_AGENT = 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)'
    event;
    dictionaryPath = {
        ERROR_BASED: path.posix.join(process.cwd(), "src/services/database-injection/signature/sql/Generic_ErrorBased.txt"),
        UNION_BASED: './dictionary/sql-injection/union-based.txt',
        BLIND_BASED: './dictionary/sql-injection/blind-based.txt',
        TIME_BASED: './dictionary/sql-injection/time-based.txt',
        BOOLEAN_BASED: './dictionary/sql-injection/boolean-based.txt',
    }

    vulnerabilities = {
        ERROR_BASED: []
    }
    // logPath = path.posix.join(process.cwd(), 'storages/logs/sql_injection.log');
    DELAY_BEFORE_NEXT_REQUEST = 500;
    constructor(clientId, options, logPath) {
        this.clientId = clientId;
        this.options = options;
        this.event = new EventEmitter();
        if (logPath) {
            this.logPath = logPath;
        }
        this.logStream = fs.createWriteStream(logPath, { flags: 'a' })
        // clear log file
        fs.writeFileSync(this.logPath, '');
        process.on('exit', () => {
            this.logStream.end();
        });
        this.event.on('end-stream-log', () => {
            this.logStream.end();
        });
    }

    endStreamLog() {
        this.event.emit('end-stream-log');
    }

    async preFetchHeaders() {
        this.event.emit('pre-fetch-headers', {
            message: "Đang lấy thông tin headers và cookies từ trình duyệt."
        });
        const browser = require('../browser').browser();
        const context = await browser.createContext({ retry: 2 });
        const page = await context.page();
        page.on('request', (request) => {
            if (request.url().includes(this.options.url)) {
                this.headers = {
                    ...request.headers(),
                    'user-agent': this.USER_AGENT,
                };
                console.log(request.headers());
            }
        });
        await page.goto(this.options.url, {
            headers: {
                "user-agent": this.USER_AGENT,
            }
        });
        const devtoolProtocol = await page.target().createCDPSession();
        const cookies = (await devtoolProtocol.send('Network.getAllCookies')).cookies;
        this.cookies = cookies;
        console.log('Cookies:', this.cookies);
        console.log('Headers:', this.headers);
        await browser.close();
        this.event.emit('fetched-headers', {
            message: "Đã lấy thông tin headers và cookies từ trình duyệt.",
            headers: this.headers,
        });
        return this.headers;
    }

    async handleRequest(url, method, params, body) {
        try {
            // console.log('Request:', { url, method, params, body });
            const response = await axios({
                url,
                method,
                params,
                data: body,
                headers: this.headers,
            });
            return {
                data: response.data,
                message: response.statusText,
            };
        } catch (error) {
            return {
                data: null,
                message: error.message,
            };
        }
    }

    async calculatedVulnerabilities(path) {
        this.event.emit('calculate-vulnerability', {
           message: "Đang tính toán nguy cơ SQL Injection dựa trên phản hồi của server."
        });
        const startTime = performance.now();
        const averageTime = this.vulnerabilities.ERROR_BASED.reduce((acc, item) => acc + item.time, 0) / this.vulnerabilities.ERROR_BASED.length;
        const timeIterable = this.vulnerabilities.ERROR_BASED.map(item => item.time);
        const minTime = Math.min(...timeIterable);
        const maxTime = Math.max(...timeIterable);
        const distance = maxTime - minTime;
        fs.writeFileSync(path, JSON.stringify(timeIterable, null, 2));
        let message = "";
        let percentage = 0;
        let pointMarked = "F";

        if (distance === 0) {
            message = "Không thể đánh giá nguy cơ do thời gian phản hồi không thay đổi.  Có thể website được bảo vệ tốt hoặc kỹ thuật kiểm tra chưa đủ hiệu quả.";
        } else {
            const K = distance / averageTime;
            percentage = (K * 100).toFixed(2);
            if (percentage >= 8000) {
                pointMarked = "F";
                message = "Nguy cơ cao!  Website có khả năng bị tấn công SQL Injection.  Cần xem xét kỹ lưỡng và áp dụng các biện pháp bảo mật cần thiết.";
            } else if (percentage >= 0) {
                pointMarked = "A";
                message = "Nguy cơ rất thấp.  Website có khả năng được bảo vệ tốt trước tấn công SQL Injection.";
            }
        }

        const endTime = performance.now();

        this.event.emit('calculated-vulnerability', {
            message,
            percentage,
            pointMarked,
            time: endTime - startTime,
        });

        return {
            pointMarked,
            message,
            percentage,
        };
    }

    async scanInjectionWithErrorBased() {
        const dictionary = await fs.promises.readFile(this.dictionaryPath.ERROR_BASED, 'utf-8');
        const payloads = dictionary.split('\n');
        const queries = payloads.map(payload => {
            const params = this.options.params;
            const body = this.options.body;
            return {
                maliciousQuery: payload,
                url: this.options.url,
                method: this.options.method,
                params: {
                    ...Object.keys(params).reduce((acc, key) => {
                        acc[key] = params[key] + payload;
                        return acc;
                    }, {}),
                },
                body: {
                    ...Object.keys(body).reduce((acc, key) => {
                        acc[key] = body[key] + payload;
                        return acc;
                    }, {}),
                },
            }
        });
        for (const query of queries) {
            const startTime = performance.now();
            const response = await this.handleRequest(query.url, query.method, query.params, query.body);
            const endTime = performance.now();

            this.event.emit('sql-injection-error-based', {
                time: endTime - startTime,
                maliciousQuery: query.maliciousQuery,
                query,
                response,
            });
            this.logStream.write(`[Request]: time:${endTime - startTime} - ${query.url} - ${query.method} - ${JSON.stringify(query.params)} - ${JSON.stringify(query.body)} - ${query.maliciousQuery}\n`);
            this.logStream.write(`[Response]: ${response.message} - ${query.maliciousQuery}\n`);
            if (response.data) {
                this.vulnerabilities.ERROR_BASED.push({
                    time: endTime - startTime,
                    query,
                    response,
                });
            }
            if (process.env.NODE_ENV === 'production') {
                await timeout(500);
            }
        }

    }

    async scanWithDictionary(dictionaryPath) {
        const dictionary = await fs.promises.readFile(dictionaryPath, 'utf-8');
        const payloads = dictionary.split('\n');
        const queries = payloads.map((payload, index) => {
            const params = this.options.params;
            const body = this.options.body;
            return {
                index,
                maliciousQuery: payload,
                url: this.options.url,
                method: this.options.method,
                params: {
                    ...Object.keys(params).reduce((acc, key) => {
                        acc[key] = params[key] + payload;
                        return acc;
                    }, {}),
                },
                body: {
                    ...Object.keys(body).reduce((acc, key) => {
                        acc[key] = body[key] + payload;
                        return acc;
                    }, {}),
                },
            }
        });
        for (const query of queries) {
            const startTime = performance.now();
            const response = await this.handleRequest(query.url, query.method, query.params, query.body);
            const endTime = performance.now();
            const time = endTime - startTime;
            const fileName = path.basename(dictionaryPath, '.txt');
            this.event.emit('sql-injection-error-based', {
                progress: {
                    process: fileName,
                    percent: ((query.index / queries.length) * 100).toFixed(2),
                },
                time,
                maliciousQuery: query.maliciousQuery,
                query,
                response,
                requestTime: startTime,
                responseTime: endTime,
            });
            this.logStream.write(`[Request]: time:${time} - ${query.url} - ${query.method} - ${JSON.stringify(query.params)} - ${JSON.stringify(query.body)} - ${query.maliciousQuery}\n`);
            this.logStream.write(`[Response]: ${response.message} - ${query.maliciousQuery}\n`);
            if (response.data) {
                this.vulnerabilities.ERROR_BASED.push({
                    time,
                    query,
                    response,
                });
            }
            // if (process.env.NODE_ENV === 'production') {
                await timeout(this.DELAY_BEFORE_NEXT_REQUEST);
            // }
        }

    }
}

module.exports = SqlInjection;