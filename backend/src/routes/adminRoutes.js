const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


//View login audit logs (Admin only)
router.get("/login-audit-logs",authMiddleware,roleMiddleware("Admin"),adminController.getLoginAuditLogs);
//Audit logs (Admin/HR)
router.get("/audit-logs", authMiddleware, roleMiddleware("Admin", "HR"), adminController.getAuditLogs);
router.get("/audit-logs/summary", authMiddleware, roleMiddleware("Admin", "HR"), adminController.getAuditSummary);
router.get("/audit-logs/alert-rule", authMiddleware, roleMiddleware("Admin"), adminController.getAuditAlertRule);
router.put("/audit-logs/alert-rule", authMiddleware, roleMiddleware("Admin"), adminController.updateAuditAlertRule);
// HR Management
router.get("/hrs", authMiddleware, roleMiddleware("Admin"), adminController.getHRs);
router.post("/hrs", authMiddleware, roleMiddleware("Admin"), adminController.createHR);
router.patch("/hrs/:id/toggle-status", authMiddleware, roleMiddleware("Admin"), adminController.toggleHRStatus);
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("Admin"),
  adminController.getDashboardStats
);
router.get(
  "/demo-requests",
  authMiddleware,
  roleMiddleware("Admin"),
  adminController.getDemoRequests
);

module.exports = router;
