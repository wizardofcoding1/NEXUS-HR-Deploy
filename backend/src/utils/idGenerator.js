const prefixByRole = {
    Employee: "EMP",
    HR: "HR",
    Admin: "ADM",
};
const Employee = require("../models/employeeModel");

const buildRandomId = (length = 6) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < length; i += 1) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
};

const getNextEmployeeId = async (role = "Employee") => {
    const prefix = prefixByRole[role] || "EMP";
    for (let i = 0; i < 10; i += 1) {
        const candidate = `${prefix}-${buildRandomId(6)}`;
        const exists = await Employee.exists({ employeeId: candidate });
        if (!exists) return candidate;
    }
    throw new Error("Failed to generate unique employee id");
};

const getNextProjectId = async () => {
    const Project = require("../models/projectSchema");
    for (let i = 0; i < 10; i += 1) {
        const candidate = `PR-${buildRandomId(6)}`;
        const exists = await Project.exists({ projectId: candidate });
        if (!exists) return candidate;
    }
    throw new Error("Failed to generate unique project id");
};

module.exports = { getNextEmployeeId, getNextProjectId };
