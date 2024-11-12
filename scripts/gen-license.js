const {TinhThanh} = require('../dist/layers/configs/region');
const {genTinhThanhLicense, SECRET_KEY, PRODUCT_EXPIRED} = require('../dist/layers/main/license');
const fs = require('fs/promises');

function formatDateForExcel2(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',     // Giờ (2 chữ số)
        minute: '2-digit',   // Phút (2 chữ số)
        second: '2-digit',   // Giây (2 chữ số - tùy chọn)
        hour12: false,       // Sử dụng định dạng 24 giờ
        timeZone: 'Asia/Ho_Chi_Minh' // Optional: Specify your timezone
    };
    return new Intl.DateTimeFormat('vi-VN', options).format(date)
}

async function gen() {
    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 50);
    expire.setHours(0);
    expire.setMinutes(0);
    expire.setSeconds(0);
    const license = await genTinhThanhLicense(SECRET_KEY, expire.getTime());

    const bindKey = {
        "name": "tên tỉnh/thành",
        "name_with_type": "Tên đầy đủ",
        "code": "Mã tỉnh/thành",
    }
    const exportCSVPath = __dirname + '/TinhThanh.csv';
    let stringCSV = '';
    stringCSV += Object.values(bindKey).join(',') + ",Thời gian hết hạn,key" + '\n';

    for (const key in TinhThanh) {
        // console.log(expire.getTime() + PRODUCT_EXPIRED)
        const item = TinhThanh[key];
        stringCSV +=
            `${item.name},`
            + `${item.name_with_type},`
            + `${item.code},`
            + `${formatDateForExcel2(expire.getTime())},`
            + `${license[key]}` + '\n';
    }

    console.log(stringCSV);

    await fs.writeFile(exportCSVPath, stringCSV);

    console.log('Done');
}

gen().then()
