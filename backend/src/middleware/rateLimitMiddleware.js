const rateLimit = require("express-rate-limit");

// Login Rate Limit brute-force protection
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        sucess: false,
        message: "Too many Login Attempts. Please Try Again Later.",
    },
});

// Forgot Password rate limit (email abuse protection)

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => {
        const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        return rawEmail || req.ip;
    },
    message: {
        success: false,
        message: "Too many password reset requests. Please try again later.",
    },
});

module.exports = {
    loginLimiter,
    forgotPasswordLimiter,
};
