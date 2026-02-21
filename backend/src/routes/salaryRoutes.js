const express = require("express");
const router = express.Router();

const salaryController = require("../controllers/salaryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create / Update salary (HR)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("HR"),
    salaryController.updateSalary,
);

// View salary (HR)
router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("HR"),
    salaryController.getSalaryByEmployee,
);

// View salary (Employee)
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("Employee", "HR", "TeamLeader", "Admin"),
    salaryController.getMySalary,
);

module.exports = router;
