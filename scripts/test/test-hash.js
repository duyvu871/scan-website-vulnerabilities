const crypto = require("crypto")
const keytar = require("keytar")

async function generateSecretKeyFromSecretString(secretString) {
    const salt = crypto.randomBytes(16) // Sử dụng salt ngẫu nhiên - RẤT QUAN TRỌNG

    return new Promise((resolve, reject) => {
        crypto.scrypt(secretString, salt, 32, (err, derivedKey) => {
            if (err) {
                reject(err)
            } else {
                resolve(derivedKey)
            }
        })
    })
}

// ... (Mã encrypt và decrypt từ ví dụ trước của bạn, chỉ cần thay đổi cách lấy secretKey)

async function exampleUsage() {
    const SERVICE_NAME = 'scan-vulnerabilities-license';
    const deleted = await keytar.deletePassword(SERVICE_NAME, 'license');
    console.log('deleted', deleted);
    // const set = await keytar.setPassword(SERVICE_NAME, 'license', '123456');
    // const pwd = await keytar.getPassword(SERVICE_NAME, 'license');
    // console.log('pwd', pwd);
    // const rewritten = await keytar.setPassword(SERVICE_NAME, 'license', 'ok');
    // const newPwd = await keytar.getPassword(SERVICE_NAME, 'license');
    // console.log('newPwd', newPwd);
}

exampleUsage().then()

// ... other code

function encrypt(text, secretKey) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv)

    let encrypted = cipher.update(text)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`
}

function decrypt(text, secretKey) {
    try {
        const [ivHex, encryptedHex] = text.split(":")

        const iv = Buffer.from(ivHex, "hex")

        const encryptedText = Buffer.from(encryptedHex, "hex")

        const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv)

        let decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])

        return decrypted.toString()
    } catch (error) {
        // console.error("Decryption error:", error)
        return null
    }
}
