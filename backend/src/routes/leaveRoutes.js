const express = require("express");
const router = express.Router();

const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply leave (Employee)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Employee"),
    leaveController.applyLeave,
);

// View my leaves (Employee)
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("Employee"),
    leaveController.getMyLeaves,
);

// View leave requests (HR / TeamLeader)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("HR"),
    leaveController.getAllLeaves,
);

// Approve / Reject leave (HR / TeamLeader)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("HR"),
    leaveController.updateLeaveStatus,
);

module.exports = router;
