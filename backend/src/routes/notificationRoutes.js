const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", authMiddleware, notificationController.getMyNotifications);

router.patch(
    "/:id",
    authMiddleware,
    notificationController.markAsRead,
);

router.delete(
    "/",
    authMiddleware,
    notificationController.clearMyNotifications,
);

module.exports = router;
