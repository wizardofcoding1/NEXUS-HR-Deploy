const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Protected route for HR stats
router.get(
    "/stats",
    authMiddleware,
    roleMiddleware("HR"),
    dashboardController.getHRStats
);

// Protected route for Dashboard Charts
router.get(
    "/charts",
    authMiddleware,
    roleMiddleware("HR"),
    dashboardController.getDashboardCharts
);

router.get(
    "/project-trends",
    authMiddleware,
    roleMiddleware("HR"),
    dashboardController.getProjectTrends
);

router.get(
    "/leave-trends",
    authMiddleware,
    roleMiddleware("HR"),
    dashboardController.getLeaveTrends
);

module.exports = router;
