const puppeteer = require('puppeteer');

/**
 * Thu thập tất cả các liên kết (href) trên một trang web, bao gồm cả các liên kết được tìm thấy trong quá trình duyệt.
 *
 * @param {string} url - URL của trang web.
 * @returns {Promise<string[]>} - Danh sách các liên kết duy nhất.
 */
async function getAllLinks(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const visitedLinks = new Set(); // Sử dụng Set để lưu trữ các liên kết duy nhất
    const linksToVisit = [url];

    // page.on('request', ())

    await browser.close();

    // Chuyển Set thành mảng
    return Array.from(visitedLinks);
}

// Chạy script
getAllLinks('https://connectedbrain.com.vn/auth/method?type=login') // Thay thế bằng URL của bạn
    .then(links => {
        console.log(links);
    });