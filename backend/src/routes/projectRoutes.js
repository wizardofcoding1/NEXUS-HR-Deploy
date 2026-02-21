const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// create project (HR)
router.post(
    "/",
    authMiddleware,
    roleMiddleware(["HR", "Admin"]),
    projectController.createProject
);

// view projects (HR / TeamLeader)
router.get(
    "/",
    authMiddleware,
    roleMiddleware(["HR", "Admin", "TeamLeader"]),
    projectController.getProject
);

// ===============================
// TEAM LEADER / EMPLOYEE DASHBOARD
// ===============================
router.get(
    "/my-dashboard",
    authMiddleware,
    roleMiddleware(["Employee", "TeamLeader"]),
    projectController.getMyDashboardProjects
);

//get project detials (HR / Team Leader)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["HR", "Admin", "TeamLeader"]),
    projectController.getProjectById
);

// update project (HR / TeamLeader)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["HR", "Admin", "TeamLeader"]),
    projectController.updateProject
);

// ===============================
// ASSIGN EMPLOYEES TO PROJECT (HR)
// ===============================
router.patch(
    "/:id/assign-employees",
    authMiddleware,
    roleMiddleware(["HR", "Admin", "TeamLeader"]),
    projectController.assignEmployeesToProject
);

router.patch(
    "/:id/unassign-employees",
    authMiddleware,
    roleMiddleware(["HR", "Admin", "TeamLeader"]),
    projectController.unassignEmployeesFromProject
);


module.exports = router;
