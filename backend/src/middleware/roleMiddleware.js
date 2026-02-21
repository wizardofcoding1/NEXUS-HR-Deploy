const sendError = require("../utils/errorHandler");

const roleMiddleware = (...allowedRoles) => {
    // ✅ Support both: ("HR", "Admin") and (["HR", "Admin"])
    const roles = allowedRoles.flat();

    return (req, res, next) => {
        const isTeamLeaderUser = req.user.teamLeader || req.user.role === "TeamLeader";
        const hasRole = roles.includes(req.user.role);
        const isTeamLeader = roles.includes("TeamLeader") && isTeamLeaderUser;
        const isEmployeeEquivalent =
            roles.includes("Employee") && isTeamLeaderUser;

        if (!hasRole && !isTeamLeader && !isEmployeeEquivalent) {
            return sendError(
                res,
                "You are not authorized to perform this action",
                403
            );
        }
        next();
    };
};

module.exports = roleMiddleware;
