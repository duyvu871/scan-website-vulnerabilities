const getHTML = require("html-get");
const Wrappalyzer = require("simple-wappalyzer");

async function getTechnologies(url){
    const htmlPage = await getHTML(url, {
        getBrowserless: require("browserless"),
    });
    const wappalyzer = await Wrappalyzer({
        url: htmlPage.url,
        html: htmlPage.html,
        statusCode: htmlPage.statusCode,
        headers: htmlPage.headers,
    });

    if (wappalyzer) {
        return wappalyzer;
    }

    return null;
}

module.exports = getTechnologies;