const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

// Mark attendance (Employee/HR)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Employee", "HR"),
    attendanceController.markAttendance,
);

// Attendance policy (Admin/HR view)
router.get(
    "/policy",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    attendanceController.getPolicy
);

// Attendance policy (Admin update)
router.put(
    "/policy",
    authMiddleware,
    roleMiddleware("Admin"),
    attendanceController.updatePolicy
);

// Get my attendance
router.get(
    "/me",
    authMiddleware,
    attendanceController.getMyAttendance
);

// Get All Attendance (HR/Admin)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    attendanceController.getAllAttendance
);

// View attendance (HR/Admin or Employee owner)
router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("HR", "Admin", "Employee"),
    ownershipMiddleware,
    attendanceController.getAttendanceByEmployee,
);

module.exports = router;
