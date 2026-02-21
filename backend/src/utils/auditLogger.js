const AuditLog = require("../models/auditLogModel");
const AuditAlertRule = require("../models/auditAlertRuleModel");

const createAuditLog = async ({
    req,
    user,
    action,
    entity,
    entityId,
    status = "SUCCESS",
    message,
    details,
}) => {
    try {
        const actor = user || req?.user || {};
        const log = await AuditLog.create({
            userId: actor.userId || actor._id,
            companyId: actor.companyId || req?.user?.companyId,
            userName: actor.name,
            userEmail: actor.email,
            role: actor.role,
            action,
            entity,
            entityId,
            status,
            message,
            details,
            ipAddress: req?.ip,
            userAgent: req?.headers?.["user-agent"],
        });

        if (global.io) {
            global.io.emit("audit:log", log);
        }

        if (entity === "Auth" && action === "LOGIN" && status === "FAILED") {
            const rule = (await AuditAlertRule.findOne()) || {
                failedLoginThreshold: 5,
                windowMinutes: 60,
                enabled: true,
            };
            if (rule.enabled) {
                const windowStart = new Date();
                windowStart.setMinutes(windowStart.getMinutes() - rule.windowMinutes);
                const failedCount = await AuditLog.countDocuments({
                    entity: "Auth",
                    action: "LOGIN",
                    status: "FAILED",
                    createdAt: { $gte: windowStart },
                });
                if (failedCount >= rule.failedLoginThreshold) {
                    global.io.emit("audit:alert", {
                        type: "FAILED_LOGIN_THRESHOLD",
                        message: `Failed logins exceeded ${rule.failedLoginThreshold} within ${rule.windowMinutes} minutes`,
                        count: failedCount,
                    });
                }
            }
        }
    } catch {
        // avoid crashing main flow
    }
};

module.exports = { createAuditLog };
