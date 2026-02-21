const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeModel");
const sendError = require("../utils/errorHandler");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.headers.cookie) {
            const cookies = req.headers.cookie
                .split(";")
                .map((c) => c.trim().split("="))
                .reduce((acc, [k, v]) => {
                    if (k) acc[k] = decodeURIComponent(v || "");
                    return acc;
                }, {});
            token = cookies.token || null;
        }

        if (!token) {
            return sendError(res, "Authentication required", 401);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const employee = await Employee.findById(decoded.userId);
        if (!employee) {
            return sendError(res, "User not found", 401);
        }

        if (
            employee.passwordChangedAt &&
            decoded.iat * 1000 < employee.passwordChangedAt.getTime()
        ) {
            return sendError(res, "Password changed. Please login again.", 401);
        }

        req.user = {
            ...decoded,
            role: employee.role,
            teamLeader: employee.teamLeader,
            companyId: decoded.companyId || employee.compnayId,
        };
        next();
    } catch (error) {
        sendError(res, "Invalid or expired token", 401);
    }
};

module.exports = authMiddleware;
