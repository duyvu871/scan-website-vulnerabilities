import * as crypto from "crypto";

const SALT = '1e735e5f19483a0a7d754341260c6d33'

async function generateSecretKeyFromSecretString(
    secretString: string
): Promise<Buffer> {
    const salt = Buffer.from(SALT, 'hex');

    return new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(secretString, salt, 32, (err, derivedKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(derivedKey);
            }
        });
    });
}

export async function encrypt(text: string, secretString: string): Promise<string> {
    const secretKey = await generateSecretKeyFromSecretString(secretString);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function decrypt(text: string, secretString: string): Promise<string | null> {
    try {
        const secretKey = await generateSecretKeyFromSecretString(secretString);

        const [ivHex, encryptedHex] = text.split(":");

        const iv = Buffer.from(ivHex, "hex");

        const encryptedText = Buffer.from(encryptedHex, "hex");

        const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
}


// async function exampleUsage() {
//     const mySecretString = "My very secret passphrase";
//
//     const secretKey = await generateSecretKeyFromSecretString(mySecretString);
//
//     console.log("secretKey (hex):", secretKey.toString("hex"));
//
//     const plainText = "This is my super secret message!";
//
//     const encryptedText = encrypt(plainText, secretKey);
//     console.log("Encrypted:", encryptedText);
//
//     const decryptedText = decrypt(encryptedText, secretKey);
//
//     if (decryptedText) {
//         console.log("Decrypted:", decryptedText);
//     }
// }