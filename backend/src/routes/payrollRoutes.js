const express = require("express");
const router = express.Router();

const payrollController = require("../controllers/payrollController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Generate payroll (HR)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    payrollController.generatePayroll,
);

// Create payroll payment (HR/Admin)
router.post(
    "/pay",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    payrollController.createPayrollPayment,
);

// Get All Payrolls (HR)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    payrollController.getAllPayrolls
);

// View payroll history (Employee)
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("Employee"),
    payrollController.getMyPayrolls,
);

// View payroll history (HR)
router.get(
    "/employee/:employeeId",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    payrollController.getPayrollByEmployee,
);

// Mark payroll as paid (HR)
router.patch(
    "/:id/pay",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    payrollController.markPayrollPaid,
);

// Confirm payroll payment (Webhook/System)
router.post(
    "/:id/confirm",
    payrollController.confirmPayrollPaid,
);

module.exports = router;
