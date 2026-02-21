const express = require("express");
const router = express.Router();

const bankDetailsController = require("../controllers/bankDetailsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ownershipMiddleware = require("../middleware/ownershipMiddleware");

// Employee or HR updates own bank details
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Employee", "HR"),
    bankDetailsController.upsertBankDetails,
);

// Get All Bank Details (HR/Admin)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("HR", "Admin"),
    bankDetailsController.getAllBankDetails
);

// View my bank details
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("Employee", "HR"),
    bankDetailsController.getMyBankDetails,
);

// View bank details (HR/Admin or owner employee)
router.get(
    "/:employeeId",
    authMiddleware,
    roleMiddleware("HR", "Employee", "Admin"),
    ownershipMiddleware,
    bankDetailsController.getBankDetails,
);

// Delete bank details (HR only)
router.delete(
    "/:employeeId",
    authMiddleware,
    roleMiddleware("HR"),
    bankDetailsController.deleteBankDetails,
);

module.exports = router;
