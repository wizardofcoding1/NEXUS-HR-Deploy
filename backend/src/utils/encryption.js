const crypto = require("crypto");

const algorithm = "aes-256-cbc";

if (!process.env.BANK_ENCRYPTION_KEY) {
    throw new Error("BANK_ENCRYPTION_KEY is missing in environment variables");
}

/**
 * We use 'hex' because your key is 64 characters long.
 * 64 Hex characters = 32 Bytes (The exact size needed for AES-256).
 * If we used 'utf8', it would be 64 Bytes, which causes "Invalid key length".
 */
const rawKey = process.env.BANK_ENCRYPTION_KEY;
const isHexKey = /^[0-9a-fA-F]+$/.test(rawKey) && rawKey.length === 64;
const secretKey = isHexKey
    ? Buffer.from(rawKey, "hex")
    : Buffer.from(rawKey, "utf8");
const encrypt = (text) => {
    if (!text) return text;

    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        return `${iv.toString("hex")}:${encrypted}`;
    } catch (error) {
        console.error("Encryption failed:", error.message);
        throw error;
    }
};

const decrypt = (encryptedText) => {
    if (!encryptedText || !encryptedText.includes(":")) return encryptedText;

    try {
        const [ivHex, encryptedData] = encryptedText.split(":");
        const iv = Buffer.from(ivHex, "hex");

        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        // If decryption fails (e.g., bad key or corrupted data), return a placeholder
        console.error("Decryption failed:", error.message);
        return "DECRYPTION_ERROR"; 
    }
};

module.exports = { encrypt, decrypt };