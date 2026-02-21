const Employee = require("../models/employeeModel");
const Project = require("../models/projectSchema");
const Attendance = require("../models/attandanceSchema");
const Payroll = require("../models/payrollSchema");
const Leave = require("../models/leaveSchema");
const BankDetails = require("../models/bankDetailsModel");
const Salary = require("../models/salarySchema");
const Notification = require("../models/notifiactionModel");
const AuditLog = require("../models/auditLogModel");
const LoginAudit = require("../models/loginAuditModel");
const sendError = require("../utils/errorHandler");
const sendResponse = require("../utils/responseHandler");
const { createAuditLog } = require("../utils/auditLogger");
const sendEmail = require("../utils/emailService");
const { getNextEmployeeId } = require("../utils/idGenerator");
const { generatePassword } = require("../utils/passwordGenerator");
const Company = require("../models/companyModel");

class EmployeeController {
    // create employee
    async createEmployee(req, res) {
        try {
            if (!req.user?.companyId) {
                return sendError(res, "Company context missing", 400);
            }
            if (req.body.dateOfJoining) {
                const joiningDate = new Date(req.body.dateOfJoining);
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

            const role = req.body.role || "Employee";
            const employeeId = req.body.employeeId || (await getNextEmployeeId(role));
            const company = req.user?.companyId
                ? await Company.findById(req.user.companyId).select("domain")
                : null;
            const domain = company?.domain || process.env.COMPANY_EMAIL_DOMAIN || "hrms.com";
            const firstName = req.body.name
                ? req.body.name
                      .trim()
                      .split(/\s+/)[0]
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "")
                : "user";
            let companyEmail =
                req.body.email || `${firstName}@${domain}`;
            if (!req.body.email) {
                const exists = await Employee.exists({ email: companyEmail });
                if (exists) {
                    companyEmail = `${firstName}.${employeeId.toLowerCase()}@${domain}`;
                }
            }

            if (req.body.personalEmail) {
                const safeEmail = String(req.body.personalEmail).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const emailRegex = new RegExp(`^${safeEmail}$`, "i");
                const existing = await Employee.findOne({
                    $or: [{ personalEmail: emailRegex }, { email: emailRegex }],
                });
                if (existing) {
                    return sendError(res, "Personal email is already in use", 400);
                }
            }

            const autoGeneratePassword =
                req.body.autoGeneratePassword === true ||
                req.body.autoGeneratePassword === "true";
            const password = autoGeneratePassword ? generatePassword() : undefined;
            const createPayload = {
                ...req.body,
                compnayId: req.user?.companyId,
                email: companyEmail,
                employeeId,
                isActivated:
                    typeof req.body.isActivated === "boolean"
                        ? req.body.isActivated
                        : autoGeneratePassword,
            };
            if (password) {
                createPayload.password = password;
            }
            const employee = await Employee.create(createPayload);

            // Notify the new employee
            await Notification.create({
                recipient: employee._id,
                title: "Account Created",
                message: "Your employee account has been created successfully.",
                type: "EMPLOYEE_CREATED",
                referenceId: employee._id,
            });
            if (global.io) {
                global.io.to(String(employee._id)).emit("notification:new", {
                    type: "EMPLOYEE_CREATED",
                    referenceId: employee._id,
                });
            }

            // Notify Admins/HRs about the new employee
            const adminsAndHrs = await Employee.find({
                role: { $in: ["Admin", "HR"] },
                compnayId: req.user?.companyId,
            }).select("_id");
            if (adminsAndHrs.length) {
                await Notification.insertMany(
                    adminsAndHrs.map((user) => ({
                        recipient: user._id,
                        title: "New Employee Onboarded",
                        message: `${employee.name} has been onboarded as an Employee.`,
                        type: "EMPLOYEE_CREATED",
                        referenceId: employee._id,
                    }))
                );
                if (global.io) {
                    adminsAndHrs.forEach((user) => {
                        global.io.to(String(user._id)).emit("notification:new", {
                            type: "EMPLOYEE_CREATED",
                            referenceId: employee._id,
                        });
                    });
                }
            }

            await createAuditLog({
                req,
                action: "CREATE",
                entity: "Employee",
                entityId: String(employee._id),
                message: "Employee created",
            });

            let activationLink = null;
            let emailError = null;
            if (employee.email) {
                try {
                    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
                    const normalizedBase = /^https?:\/\//i.test(baseUrl)
                        ? baseUrl
                        : `http://${baseUrl}`;
                    activationLink = `${normalizedBase}/activate?email=${encodeURIComponent(employee.email)}`;
                    const sendPasswordEmails =
                        String(process.env.SEND_PASSWORD_EMAILS || "true") !==
                        "false";
                    if (sendPasswordEmails) {
                        const html = autoGeneratePassword
                            ? `
                                <p>Hello ${employee.name},</p>
                                <p>Your HRMS account has been created.</p>
                                <p><b>Company Email:</b> ${employee.email}</p>
                                <p><b>Password:</b> ${password}</p>
                                <p>Please activate your account using the link below:</p>
                                <p><a href="${activationLink}">${activationLink}</a></p>
                            `
                            : `
                                <p>Hello ${employee.name},</p>
                                <p>Your HRMS account has been created.</p>
                                <p><b>Company Email:</b> ${employee.email}</p>
                                <p>Please activate your account using the link below:</p>
                                <p><a href="${activationLink}">${activationLink}</a></p>
                            `;
                        await sendEmail({
                            to: employee.personalEmail || employee.email,
                            subject: "Welcome to HRMS",
                            html,
                        });
                    } else {
                        emailError = "Password emails are disabled by configuration.";
                    }
                } catch (error) {
                    emailError = error.message;
                    console.error("Send email failed:", error.message);
                }
            }

            sendResponse(
                res,
                "Employee created successfully",
                {
                    _id: employee._id,
                    employeeId: employee.employeeId,
                    name: employee.name,
                    email: employee.email,
                    personalEmail: employee.personalEmail,
                    activationLink,
                    generatedPassword: autoGeneratePassword ? password : undefined,
                    autoGeneratePassword,
                    emailError,
                },
                null,
                201,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // get all employees (role aware + populated)
    // get all employees (role aware + query support)
    async getAllEmployees(req, res) {
        try {
            const { role: userRole } = req.user;
            const { role: queryRole, teamLeader } = req.query;

            let filter = {};
            if (req.user?.companyId) {
                filter.compnayId = req.user.companyId;
            }

            // Explicit role query (used for TL dropdown)
            if (queryRole) {
                filter = { ...filter, role: queryRole };
            } else if (teamLeader === "true") {
                filter = { ...filter, teamLeader: true };
            } else {
                // Default behavior based on logged-in user
                if (userRole === "HR") {
                    filter = {
                        ...filter,
                        role: { $in: ["Employee", "TeamLeader"] },
                    };
                }

                if (userRole === "Admin") {
                    filter = {
                        ...filter,
                        role: { $in: ["HR", "Employee", "TeamLeader"] },
                    };
                }
            }

            const employees = await Employee.find(filter)
                .populate({
                    path: "reportsTo",
                    select: "name email employeeId role",
                })
                .populate({
                    path: "projectWorking",
                    select: "projectId projectName client status startDate endDate",
                    populate: {
                        path: "teamLeader",
                        select: "name employeeId",
                    },
                });
            await Employee.populate(employees, {
                path: "projectHistory",
                select: "projectId projectName client status startDate endDate",
                populate: {
                    path: "teamLeader",
                    select: "name employeeId",
                },
            });

            sendResponse(
                res,
                "Employees fetched successfully",
                employees,
                employees.length,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // get single employee profile (HR / Admin)
    async getEmployeeById(req, res) {
        try {
            const employee = await Employee.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            })
                .populate({
                    path: "reportsTo",
                    select: "name email employeeId role",
                })
                .populate({
                    path: "projectWorking",
                    select: "projectId projectName client status startDate endDate",
                    populate: {
                        path: "teamLeader",
                        select: "name employeeId",
                    },
                });
            await employee?.populate({
                path: "projectHistory",
                select: "projectId projectName client status startDate endDate",
                populate: {
                    path: "teamLeader",
                    select: "name employeeId",
                },
            });

            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            sendResponse(res, "Employee data fetched successfully", employee);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // get my profile (all roles)
    async getMyProfile(req, res) {
        try {
            const employee = await Employee.findById(req.user.userId)
                .populate({
                    path: "reportsTo",
                    select: "name email employeeId role",
                })
                .populate({
                    path: "projectWorking",
                    select: "projectId projectName client status startDate endDate",
                    populate: {
                        path: "teamLeader",
                        select: "name employeeId",
                    },
                });
            await employee?.populate({
                path: "projectHistory",
                select: "projectId projectName client status startDate endDate",
                populate: {
                    path: "teamLeader",
                    select: "name employeeId",
                },
            });

            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            sendResponse(res, "My profile fetched successfully", employee);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // update employee
    async updateEmployee(req, res) {
        try {
            if (req.user.role === "Admin") {
                return sendError(res, "Admin cannot edit employee or HR profiles", 403);
            }
            const updates = { ...req.body };

            if (req.user.role !== "Admin") {
                delete updates.maxActiveProjects;
            }

            const employee = await Employee.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            });

            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            if (updates.personalEmail) {
                const safeEmail = String(updates.personalEmail).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const emailRegex = new RegExp(`^${safeEmail}$`, "i");
                const existing = await Employee.findOne({
                    _id: { $ne: employee._id },
                    $or: [{ personalEmail: emailRegex }, { email: emailRegex }],
                });
                if (existing) {
                    return sendError(res, "Personal email is already in use", 400);
                }
            }

            if (updates.role && updates.role !== employee.role) {
                if (updates.role === "HR") {
                    if (employee.role !== "Employee") {
                        return sendError(
                            res,
                            "Only an Employee can be promoted to HR",
                            400,
                        );
                    }

                    if (!employee.dateOfJoining) {
                        return sendError(
                            res,
                            "Employee join date is required for promotion",
                            400,
                        );
                    }

                    const joinDate = new Date(employee.dateOfJoining);
                    const eligibleDate = new Date(joinDate);
                    eligibleDate.setMonth(eligibleDate.getMonth() + 6);
                    const today = new Date();

                    if (today < eligibleDate) {
                        return sendError(
                            res,
                            "Employee must complete 6 months to become HR",
                            400,
                        );
                    }
                }

                if (updates.role === "TeamLeader") {
                    if (employee.role !== "Employee") {
                        return sendError(
                            res,
                            "Only an Employee can be promoted to Team Leader",
                            400,
                        );
                    }
                    updates.teamLeader = true;
                }

                if (updates.role === "Employee" && employee.role === "TeamLeader") {
                    const remaining = await Project.countDocuments({
                        teamLeader: employee._id,
                        status: { $ne: "Completed" },
                    });
                    if (remaining > 0) {
                        return sendError(
                            res,
                            "Team Leader has active projects and cannot be demoted",
                            400,
                        );
                    }
                    updates.teamLeader = false;
                }
            }

            if (typeof updates.teamLeader === "boolean") {
                if (employee.role === "Admin" || employee.role === "HR") {
                    delete updates.teamLeader;
                } else if (updates.teamLeader) {
                    updates.role = "TeamLeader";
                } else {
                    const remaining = await Project.countDocuments({
                        teamLeader: employee._id,
                        status: { $ne: "Completed" },
                    });
                    if (remaining > 0) {
                        return sendError(
                            res,
                            "Team Leader has active projects and cannot be demoted",
                            400,
                        );
                    }
                    updates.role = "Employee";
                }
            }

            Object.assign(employee, updates);
            await employee.save();

            await createAuditLog({
                req,
                action: "UPDATE",
                entity: "Employee",
                entityId: String(employee._id),
                message: "Employee updated",
            });

            sendResponse(res, "Employee updated successfully", employee);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // update MY profile (Safe fields only)
    async updateMyProfile(req, res) {
        try {
            const allowedUpdates = ["phone", "aadharNumber", "panNumber"];
            const updates = {};
            
            Object.keys(req.body).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    updates[key] = req.body[key];
                }
            });

            const employee = await Employee.findByIdAndUpdate(
                req.user.userId,
                updates,
                { new: true, runValidators: true }
            );

            await createAuditLog({
                req,
                action: "UPDATE",
                entity: "Employee",
                entityId: String(employee._id),
                message: "Profile updated",
            });

            sendResponse(res, "Profile updated successfully", employee);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // activate / deactivate employee
    async deactivateEmployee(req, res) {
        try {
            const employee = await Employee.findOneAndUpdate(
                {
                    _id: req.params.id,
                    ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                },
                { isActive: false },
                { new: true },
            );

            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            await createAuditLog({
                req,
                action: "DEACTIVATE",
                entity: "Employee",
                entityId: String(employee._id),
                message: "Employee deactivated",
            });

            sendResponse(res, "Employee deactivated successfully", employee);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // delete employee (Admin or HR)
    async deleteEmployee(req, res) {
        try {
            const filter = {
                _id: req.params.id,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            };

            const employee = await Employee.findOne(filter);
            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            if (req.user.role === "HR") {
                if (!["Employee", "TeamLeader"].includes(employee.role)) {
                    return sendError(res, "HR can only delete employees", 403);
                }
            }

            if (req.user.role === "Admin") {
                if (employee.role === "Admin") {
                    return sendError(res, "Admin cannot delete other admins", 403);
                }
            }

            const companyFilter = req.user?.companyId
                ? { companyId: req.user.companyId }
                : {};

            await Promise.all([
                Attendance.deleteMany({
                    employee: employee._id,
                    ...companyFilter,
                }),
                Payroll.deleteMany({
                    employee: employee._id,
                    ...companyFilter,
                }),
                Leave.deleteMany({
                    employee: employee._id,
                    ...companyFilter,
                }),
                BankDetails.deleteMany({
                    employee: employee._id,
                    ...companyFilter,
                }),
                Salary.deleteMany({
                    employee: employee._id,
                    ...companyFilter,
                }),
                Notification.deleteMany({ recipient: employee._id }),
                AuditLog.deleteMany({
                    userId: employee._id,
                    ...companyFilter,
                }),
                LoginAudit.deleteMany({
                    userId: employee._id,
                    ...companyFilter,
                }),
                Employee.updateMany(
                    {
                        reportsTo: employee._id,
                        ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                    },
                    { $unset: { reportsTo: "" } },
                ),
                Project.updateMany(
                    {
                        employees: employee._id,
                        ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                    },
                    { $pull: { employees: employee._id } },
                ),
                Project.updateMany(
                    {
                        teamLeader: employee._id,
                        ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                    },
                    { $unset: { teamLeader: "" }, $set: { teamLocked: false } },
                ),
            ]);

            await Employee.deleteOne({ _id: employee._id });

            await createAuditLog({
                req,
                action: "DELETE",
                entity: "Employee",
                entityId: String(employee._id),
                message: "Employee deleted",
                details: { role: employee.role },
            });

            sendResponse(res, "Employee deleted successfully");
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // assign team leader to employee (HR only)
    async assignTeamLeader(req, res) {
        try {
            const { id } = req.params; // employee id
            const { teamLeaderId } = req.body;

            if (!teamLeaderId) {
                return sendError(res, "Team Leader ID is required", 400);
            }

            // find employee
            const employee = await Employee.findOne({
                _id: id,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            });
            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            // find team leader
            const teamLeader = await Employee.findOne({
                _id: teamLeaderId,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            });
            if (!teamLeader) {
                return sendError(res, "Team Leader not found", 404);
            }

            // validate role
            if (!["Employee", "TeamLeader"].includes(teamLeader.role)) {
                return sendError(
                    res,
                    "Selected user is not eligible for Team Leader",
                    400,
                );
            }

            // assign TL
            employee.reportsTo = teamLeader._id;
            teamLeader.teamLeader = true;
            teamLeader.role = "TeamLeader";
            await teamLeader.save();
            await employee.save();

            // populate before sending response
            await employee.populate({
                path: "reportsTo",
                select: "name email employeeId role",
            });

            await createAuditLog({
                req,
                action: "ASSIGN",
                entity: "TeamLeader",
                entityId: String(teamLeader._id),
                message: "Team leader assigned",
                details: { employeeId: String(employee._id) },
            });

            sendResponse(res, "Team Leader assigned successfully", employee);
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new EmployeeController();
