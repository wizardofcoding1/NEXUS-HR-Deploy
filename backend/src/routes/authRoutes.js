const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const {
    loginLimiter,
    forgotPasswordLimiter,
} = require("../middleware/rateLimitMiddleware");

// Login (rate-limited)
router.post("/login", loginLimiter, authController.login);

// New employee activation
router.post("/activate", authController.activateAccount);

// Forgot password (rate-limited)
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    authController.forgotPassword,
);

// Reset password
router.post("/reset-password/:token", authController.resetPassword);

// Change password (logged-in user)
router.post("/change-password", authMiddleware, authController.changePassword);
// Refresh current user (logged-in user)
router.get("/me", authMiddleware, authController.getMe);
// Logout (clear cookie)
router.post("/logout", authMiddleware, authController.logout);
console.log("loginLimiter:", loginLimiter);

module.exports = router;
