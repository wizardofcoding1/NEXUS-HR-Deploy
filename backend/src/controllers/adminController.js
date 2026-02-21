const LoginAudit = require("../models/loginAuditModel");
const AuditLog = require("../models/auditLogModel");
const AuditAlertRule = require("../models/auditAlertRuleModel");
const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");
const Employee = require("../models/employeeModel");
const Company = require("../models/companyModel");
const RequestDemo = require("../models/requestDemoModel");
const Notification = require("../models/notifiactionModel");

class AdminController {
    //View Login audit Logs (Amdin Only)
    async getLoginAuditLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const filter = {};

            if (req.query.status) filter.status = req.query.status;
            if (req.query.email) filter.email = req.query.email;
            if (req.query.role) filter.role = req.query.role;

            if (req.query.fromDate && req.query.toDate) {
                filter.createdAt = {
                    $gte: new Date(req.query.fromDate),
                    $lte: new Date(req.query.toDate),
                };
            }

            if (req.user?.companyId) {
                filter.companyId = req.user.companyId;
            }

            const logs = await LoginAudit.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await LoginAudit.countDocuments(filter);

            sendResponse(res, "Login audit logs fetched", logs, total);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getDashboardStats(req, res) {
        try {
            const baseFilter = req.user?.companyId
                ? { compnayId: req.user.companyId }
                : {};
            const totalUsers = await Employee.countDocuments(baseFilter);
            const activeUsers = await Employee.countDocuments({
                ...baseFilter,
                isActive: true,
            });
            const lockedUsers = await Employee.countDocuments({
                ...baseFilter,
                lockUntil: { $gt: Date.now() },
            });
            const failedLogins = await LoginAudit.countDocuments({
                status: "FAILED",
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });

            sendResponse(res, "Admin dashboard stats", {
                totalUsers,
                activeUsers,
                lockedUsers,
                failedLogins,
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getAuditLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const filter = {};
            if (req.query.status) filter.status = req.query.status;
            if (req.query.role) filter.role = req.query.role;
            if (req.query.entity) filter.entity = req.query.entity;
            if (req.query.action) filter.action = req.query.action;
            if (req.query.userId) filter.userId = req.query.userId;
            if (req.user?.companyId) filter.companyId = req.user.companyId;
            if (req.query.fromDate && req.query.toDate) {
                filter.createdAt = {
                    $gte: new Date(req.query.fromDate),
                    $lte: new Date(req.query.toDate),
                };
            }

            const logs = await AuditLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await AuditLog.countDocuments(filter);

            sendResponse(res, "Audit logs fetched", {
                logs,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getAuditSummary(req, res) {
        try {
            const match = {};
            if (req.query.fromDate && req.query.toDate) {
                match.createdAt = {
                    $gte: new Date(req.query.fromDate),
                    $lte: new Date(req.query.toDate),
                };
            }
            if (req.user?.companyId) {
                match.companyId = req.user.companyId;
            }

            const byAction = await AuditLog.aggregate([
                { $match: match },
                { $group: { _id: "$action", count: { $sum: 1 } } },
            ]);

            const byEntity = await AuditLog.aggregate([
                { $match: match },
                { $group: { _id: "$entity", count: { $sum: 1 } } },
            ]);

            const byRole = await AuditLog.aggregate([
                { $match: match },
                { $group: { _id: "$role", count: { $sum: 1 } } },
            ]);

            const byStatus = await AuditLog.aggregate([
                { $match: match },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]);

            const topUsers = await AuditLog.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$userId",
                        name: { $first: "$userName" },
                        email: { $first: "$userEmail" },
                        role: { $first: "$role" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]);

            const last7Days = new Date();
            last7Days.setDate(last7Days.getDate() - 6);
            const weekly = await AuditLog.aggregate([
                { $match: { createdAt: { $gte: last7Days } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            sendResponse(res, "Audit summary fetched", {
                byAction,
                byEntity,
                byRole,
                byStatus,
                topUsers,
                weekly,
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getAuditAlertRule(req, res) {
        try {
            const rule = await AuditAlertRule.findOne();
            sendResponse(res, "Audit alert rule fetched", rule || {
                failedLoginThreshold: 5,
                windowMinutes: 60,
                enabled: true,
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async updateAuditAlertRule(req, res) {
        try {
            let rule = await AuditAlertRule.findOne();
            if (!rule) {
                rule = await AuditAlertRule.create(req.body);
            } else {
                Object.assign(rule, req.body);
                await rule.save();
            }
            sendResponse(res, "Audit alert rule updated", rule);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // HR Management
    async getHRs(req, res) {
        try {
            const filter = { role: "HR" };
            if (req.user?.companyId) {
                filter.compnayId = req.user.companyId;
            }
            if (req.query.status) {
                filter.isActive = req.query.status === "active";
            }
            if (req.query.department) {
                filter.department = req.query.department;
            }
            if (req.query.shift) {
                filter.shift = req.query.shift;
            }
            const hrs = await Employee.find(filter).sort({ createdAt: -1 });
            sendResponse(res, "HRs fetched", hrs, hrs.length);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async createHR(req, res) {
        try {
            if (!req.user?.companyId) {
                return sendError(res, "Company context missing", 400);
            }
            const {
                name,
                personalEmail,
                phone,
                department,
                position,
                dateOfJoining,
                aadharNumber,
                panNumber,
                shift,
                shiftType,
            } = req.body;

            if (!name || !personalEmail || !phone || !department || !position || !dateOfJoining) {
                return sendError(res, "All required fields must be filled", 400);
            }
            if (dateOfJoining) {
                const joiningDate = new Date(dateOfJoining);
                const today = new Date();
                joiningDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                if (joiningDate < today) {
                    return sendError(
                        res,
                        "Date of joining must be today or a future date",
                        400,
                    );
                }
            }

            const { getNextEmployeeId } = require("../utils/idGenerator");
            const employeeId = await getNextEmployeeId("HR");

            const company = req.user?.companyId
                ? await Company.findById(req.user.companyId).select("domain")
                : null;
            const domain = company?.domain || process.env.COMPANY_EMAIL_DOMAIN || "hrms.com";
            const firstName = name
                .trim()
                .split(/\s+/)[0]
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "");
            let companyEmail = `${firstName}@${domain}`;
            const exists = await Employee.exists({ email: companyEmail });
            if (exists) {
                companyEmail = `${firstName}.${employeeId.toLowerCase()}@${domain}`;
            }
            const companyLocal = companyEmail.split("@")[0] || "user";
            const personalLocal = personalEmail.split("@")[0] || "user";
            const password =
                req.body.password ||
                `${companyLocal}@${personalLocal}#${companyLocal.length}${personalLocal.length}`;

            const employee = await Employee.create({
                compnayId: req.user?.companyId,
                employeeId,
                name,
                email: companyEmail,
                personalEmail,
                password,
                phone,
                role: "HR",
                department,
                position,
                dateOfJoining,
                aadharNumber,
                panNumber,
                isActive: true,
                isActivated: true,
                shift: shift || "Morning",
                shiftType: shiftType || "Fixed",
            });

            let emailError = null;
            try {
                const sendEmail = require("../utils/emailService");
                const activationLink = `${process.env.FRONTEND_URL}/activate?email=${encodeURIComponent(companyEmail)}`;
                const sendPasswordEmails =
                    String(process.env.SEND_PASSWORD_EMAILS || "true") !==
                    "false";
                if (sendPasswordEmails) {
                    await sendEmail({
                        to: personalEmail,
                        subject: "HRMS Account Created",
                        html: `
                            <p>Hello ${name},</p>
                            <p>Your HRMS account has been created.</p>
                            <p><b>Company Email:</b> ${companyEmail}</p>
                            <p><b>Password:</b> ${password}</p>
                            <p>Please activate your account using the link below:</p>
                            <p><a href="${activationLink}">${activationLink}</a></p>
                        `,
                    });
                } else {
                    emailError = "Password emails are disabled by configuration.";
                }
            } catch (error) {
                emailError = error.message;
                console.error("Send email failed:", error.message);
            }

            // Notifications: new HR + Admins
            await Notification.create({
                recipient: employee._id,
                title: "Account Created",
                message: "Your HR account has been created successfully.",
                type: "HR_CREATED",
                referenceId: employee._id,
            });
            if (global.io) {
                global.io.to(String(employee._id)).emit("notification:new", {
                    type: "HR_CREATED",
                    referenceId: employee._id,
                });
            }

            const admins = await Employee.find({
                role: "Admin",
                compnayId: req.user?.companyId,
            }).select("_id");
            if (admins.length) {
                await Notification.insertMany(
                    admins.map((admin) => ({
                        recipient: admin._id,
                        title: "New HR Onboarded",
                        message: `${employee.name} has been onboarded as HR.`,
                        type: "HR_CREATED",
                        referenceId: employee._id,
                    }))
                );
                if (global.io) {
                    admins.forEach((admin) => {
                        global.io.to(String(admin._id)).emit("notification:new", {
                            type: "HR_CREATED",
                            referenceId: employee._id,
                        });
                    });
                }
            }

            sendResponse(res, "HR created", {
                _id: employee._id,
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                personalEmail: employee.personalEmail,
                phone: employee.phone,
                role: employee.role,
                password,
                emailError,
            }, null, 201);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async toggleHRStatus(req, res) {
        try {
            const hr = await Employee.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            });
            if (!hr || hr.role !== "HR") {
                return sendError(res, "HR not found", 404);
            }
            hr.isActive = !hr.isActive;
            await hr.save();
            sendResponse(res, "HR status updated", hr);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getDemoRequests(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            const skip = (page - 1) * limit;
            const search = (req.query.search || "").trim();

            const filter = {};
            if (search) {
                const regex = new RegExp(search, "i");
                filter.$or = [
                    { fullName: regex },
                    { email: regex },
                    { phone: regex },
                    { company: regex },
                    { purpose: regex },
                ];
            }

            const requests = await RequestDemo.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await RequestDemo.countDocuments(filter);

            sendResponse(res, "Demo requests fetched", {
                requests,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total,
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new AdminController();
