const crypto = require("crypto");

const generatePassword = () => {
    const core = crypto
        .randomBytes(6)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 8);
    const digits = crypto.randomInt(10, 99);
    return `${core}@${digits}`;
};

module.exports = { generatePassword };
