const sendError = require("../utils/errorHandler");

const ownershipMiddleware = (req, res, next) => {
    if (req.user.role === "HR" || req.user.role === "Admin") {
        return next();
    }
    if (req.user.userId !== req.params.employeeId) {
        return sendError(res, "Access denied", 403);
    }
    next();
};

module.exports = ownershipMiddleware;
