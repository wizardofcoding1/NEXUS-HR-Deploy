const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// create employee (HR or Admin)
router.post(
    "/create",
    authMiddleware,
    roleMiddleware(["HR", "Admin"]),
    employeeController.createEmployee
);

// get all employees (HR + Admin)
router.get(
    "/",
    authMiddleware,
    roleMiddleware(["HR", "Admin"]),
    employeeController.getAllEmployees
);

// get my profile (any authenticated user)
router.get(
    "/me",
    authMiddleware,
    employeeController.getMyProfile
);

// get single employee profile (HR + Admin)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["HR", "Admin"]),
    employeeController.getEmployeeById
);

// update employee (HR only)
// Update Employee (HR Only or specialized route for self?)
// Let's add specific self-update route BEFORE the :id param route to avoid collision
router.put(
    "/me/update",
    authMiddleware,
    employeeController.updateMyProfile
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["HR"]),
    employeeController.updateEmployee
);

// activate / deactivate employee (HR only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["HR"]),
    employeeController.deactivateEmployee
);

// delete employee (HR or Admin)
router.delete(
    "/:id/remove",
    authMiddleware,
    roleMiddleware(["HR", "Admin"]),
    employeeController.deleteEmployee
);

// =========================
// ASSIGN TEAM LEADER (HR ONLY)
// =========================
router.patch(
    "/:id/assign-tl",
    authMiddleware,
    roleMiddleware(["HR"]),
    employeeController.assignTeamLeader
);

module.exports = router;
