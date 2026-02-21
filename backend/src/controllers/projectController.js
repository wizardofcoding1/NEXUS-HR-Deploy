const mongoose = require("mongoose");
const Project = require("../models/projectSchema");
const Notification = require("../models/notifiactionModel");
const Employee = require("../models/employeeModel");
const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");
const { createAuditLog } = require("../utils/auditLogger");
const { getNextProjectId } = require("../utils/idGenerator");

const notifyRecipients = async ({ recipients, title, message, type, referenceId }) => {
    const unique = Array.from(
        new Set((recipients || []).map((id) => String(id)).filter(Boolean))
    );
    if (!unique.length) return;
    const docs = unique.map((recipient) => ({
        recipient,
        title,
        message,
        type,
        referenceId: referenceId || null,
    }));
    await Notification.insertMany(docs);
    if (global.io) {
        unique.forEach((recipient) => {
            global.io.to(recipient).emit("notification:new", {
                type,
                referenceId: referenceId || null,
            });
        });
    }
};

class ProjectController {
    // CREATE PROJECT
    async createProject(req, res) {
        try {
            const {
                projectName,
                description,
                client,
                teamLeader,
                startDate,
                endDate,
                slotCount,
            } = req.body;

            if (!projectName || !description || !client || !teamLeader || !startDate) {
                return sendError(res, "All required fields must be filled", 400);
            }

            const teamLeaderEmployee = await Employee.findOne({
                _id: teamLeader,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            });
            if (!teamLeaderEmployee) {
                return sendError(res, "Team Leader not found", 404);
            }

            if (teamLeaderEmployee.role !== "Employee") {
                return sendError(res, "Selected user is not eligible for Team Leader", 400);
            }
            if (teamLeaderEmployee.teamLeader) {
                const activeLeadCount = await Project.countDocuments({
                    teamLeader: teamLeaderEmployee._id,
                    status: { $ne: "Completed" },
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                });
                if (activeLeadCount > 0) {
                    return sendError(res, "Selected user is already a Team Leader", 400);
                }
            }

            const allowedSlotCount = req.user.role === "Admin" ? slotCount : undefined;

            const start = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);

            const computedStatus = start > today ? "Scheduled" : "Ongoing";

            const project = await Project.create({
                projectId: await getNextProjectId(), // AUTO
                companyId: req.user?.companyId,
                projectName,
                description,
                client,
                teamLeader,
                startDate,
                endDate,
                slotCount: allowedSlotCount,
                status: computedStatus,
                createdBy: req.user.userId,
                createdByRole: req.user.role,
            });

            teamLeaderEmployee.teamLeader = true;
            teamLeaderEmployee.role = "TeamLeader";
            if (!teamLeaderEmployee.projectWorking) {
                teamLeaderEmployee.projectWorking = [];
            }
            if (
                !teamLeaderEmployee.projectWorking.some(
                    (id) => id.toString() === project._id.toString(),
                )
            ) {
                teamLeaderEmployee.projectWorking.push(project._id);
            }
            const alreadyTracked = (teamLeaderEmployee.teamLeaderHistory || []).some(
                (entry) => entry.project?.toString() === project._id.toString(),
            );
            if (!alreadyTracked) {
                teamLeaderEmployee.teamLeaderHistory.push({
                    project: project._id,
                    assignedAt: new Date(),
                });
            }
            await teamLeaderEmployee.save();

            await createAuditLog({
                req,
                action: "CREATE",
                entity: "Project",
                entityId: String(project._id),
                message: "Project created",
            });

            // Notify Team Leader + Admins/HRs
            const adminsAndHrs = await Employee.find({
                role: { $in: ["Admin", "HR"] },
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            }).select("_id");
            await notifyRecipients({
                recipients: [
                    teamLeaderEmployee._id,
                    ...adminsAndHrs.map((u) => u._id),
                ],
                title: "Project Created",
                message: `A new project has been created: "${project.projectName}".`,
                type: "PROJECT_CREATED",
                referenceId: project._id,
            });

            sendResponse(res, "Project created successfully", project);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // GET ALL PROJECTS
    async getProject(req, res) {
        try {
            const projects = await Project.find(
                req.user?.companyId ? { companyId: req.user.companyId } : {}
            )
                .populate("teamLeader", "name employeeId email")
                .populate("employees", "name employeeId email department position");

            sendResponse(res, "Projects fetched successfully", projects);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getProjectById(req, res) {
        try {
            const project = await Project.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            })
                .populate("teamLeader", "name employeeId email")
                .populate("employees", "name employeeId email department position");

            if (!project) {
                return sendError(res, "Project not found", 404);
            }

            sendResponse(res, "Project fetched successfully", project);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // UPDATE PROJECT
    async updateProject(req, res) {
        try {
            const project = await Project.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!project) {
                return sendError(res, "Project not found", 404);
            }

            const updates = { ...req.body };
            const isEmployeeRole =
                req.user.role === "Employee" || req.user.role === "TeamLeader";
            const isTeamLeaderUser =
                req.user.teamLeader || req.user.role === "TeamLeader";
            const isProjectTeamLeader =
                project.teamLeader &&
                project.teamLeader.toString() === req.user.userId &&
                isTeamLeaderUser;

            if (isTeamLeaderUser && req.user.role !== "HR" && req.user.role !== "Admin") {
                if (!isProjectTeamLeader) {
                    return sendError(res, "Not authorized to update this project", 403);
                }

                const allowedFields = ["description", "endDate", "status"];
                const invalidFields = Object.keys(updates).filter(
                    (key) => !allowedFields.includes(key)
                );
                if (invalidFields.length > 0) {
                    return sendError(
                        res,
                        `Team Leader can only update: ${allowedFields.join(", ")}`,
                        403
                    );
                }
            }

            if (typeof updates.slotCount !== "undefined" && req.user.role !== "Admin") {
                return sendError(res, "Only Admin can update slot count", 403);
            }

            if (typeof updates.teamLocked !== "undefined" && isEmployeeRole && !req.user.teamLeader) {
                return sendError(res, "Not authorized to update team lock", 403);
            }

            if (project.teamLocked && (updates.teamLeader || updates.employees)) {
                return sendError(res, "Team is locked for this project", 400);
            }

            if (updates.teamLeader) {
                const teamLeaderEmployee = await Employee.findOne({
                    _id: updates.teamLeader,
                    ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                });
                if (!teamLeaderEmployee) {
                    return sendError(res, "Team Leader not found", 404);
                }

                if (teamLeaderEmployee.role !== "Employee") {
                    return sendError(res, "Selected user is not eligible for Team Leader", 400);
                }
                if (
                    teamLeaderEmployee.teamLeader &&
                    updates.teamLeader.toString() !== project.teamLeader?.toString()
                ) {
                    const activeLeadCount = await Project.countDocuments({
                        teamLeader: teamLeaderEmployee._id,
                        status: { $ne: "Completed" },
                        ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                    });
                    if (activeLeadCount > 0) {
                        return sendError(res, "Selected user is already a Team Leader", 400);
                    }
                }
            }

            if (updates.status) {
                const canUpdateStatus = req.user.role === "Admin" || req.user.role === "HR" || isProjectTeamLeader;

                if (!canUpdateStatus) {
                    return sendError(res, "Not authorized to update project status", 403);
                }
            }

            const wasCompleted = project.status === "Completed";
            const isCompleting = updates.status === "Completed" && !wasCompleted;
            const previousTeamLeader = project.teamLeader;

            Object.assign(project, updates);
            await project.save();

            if (updates.teamLeader && updates.teamLeader.toString() !== previousTeamLeader?.toString()) {
                const previousLeaderId = previousTeamLeader;
                if (previousLeaderId) {
                    const previousLeader = await Employee.findOne({
                        _id: previousLeaderId,
                        ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                    });
                    if (previousLeader) {
                        previousLeader.projectWorking = (previousLeader.projectWorking || []).filter(
                            (id) => id.toString() !== project._id.toString(),
                        );
                        const historyEntry = (previousLeader.teamLeaderHistory || []).find(
                            (entry) =>
                                entry.project?.toString() === project._id.toString() &&
                                !entry.releasedAt,
                        );
                        if (historyEntry) {
                            historyEntry.releasedAt = new Date();
                        }

                        const remaining = await Project.countDocuments({
                            teamLeader: previousLeaderId,
                            status: { $ne: "Completed" },
                            ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                        });
                        if (remaining === 0) {
                            previousLeader.teamLeader = false;
                            if (previousLeader.role === "TeamLeader") {
                                previousLeader.role = "Employee";
                            }
                        }
                        await previousLeader.save();
                    }
                }

                const newLeader = await Employee.findOne({
                    _id: updates.teamLeader,
                    ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                });
                if (newLeader) {
                    newLeader.teamLeader = true;
                    newLeader.role = "TeamLeader";
                    if (!newLeader.projectWorking) {
                        newLeader.projectWorking = [];
                    }
                    if (
                        !newLeader.projectWorking.some(
                            (id) => id.toString() === project._id.toString(),
                        )
                    ) {
                        newLeader.projectWorking.push(project._id);
                    }
                    const alreadyTracked = (newLeader.teamLeaderHistory || []).some(
                        (entry) => entry.project?.toString() === project._id.toString(),
                    );
                    if (!alreadyTracked) {
                        newLeader.teamLeaderHistory.push({
                            project: project._id,
                            assignedAt: new Date(),
                        });
                    }
                    await newLeader.save();

                    await notifyRecipients({
                        recipients: [newLeader._id],
                        title: "Team Leader Assignment",
                        message: `You have been assigned as Team Leader for project "${project.projectName}".`,
                        type: "TEAMLEADER_ASSIGNED",
                        referenceId: project._id,
                    });
                }
            }

            if (isCompleting) {
                if (project.employees.length > 0) {
                    await Employee.updateMany(
                        {
                            _id: { $in: project.employees },
                            ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                        },
                        {
                            $pull: { projectWorking: project._id },
                            $addToSet: { projectHistory: project._id },
                        },
                    );
                }

                // Update Team Leader history
                if (project.teamLeader) {
                    const leader = await Employee.findOne({
                        _id: project.teamLeader,
                        ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                    });
                    if (leader) {
                        leader.projectWorking = (leader.projectWorking || []).filter(
                            (id) => id.toString() !== project._id.toString(),
                        );
                        if (!leader.projectHistory) {
                            leader.projectHistory = [];
                        }
                        if (!leader.projectHistory.some((id) => id.toString() === project._id.toString())) {
                            leader.projectHistory.push(project._id);
                        }

                        const historyEntry = (leader.teamLeaderHistory || []).find(
                            (entry) =>
                                entry.project?.toString() === project._id.toString() &&
                                !entry.releasedAt,
                        );
                        if (historyEntry) {
                            historyEntry.releasedAt = new Date();
                        }

                        await leader.save();
                    }
                }

                if (project.teamLeader) {
                    const remaining = await Project.countDocuments({
                        teamLeader: project.teamLeader,
                        status: { $ne: "Completed" },
                        ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                    });
                    if (remaining === 0) {
                        await Employee.findOneAndUpdate(
                            {
                                _id: project.teamLeader,
                                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                            },
                            {
                            teamLeader: false,
                            role: "Employee",
                        });
                    }
                }
            }

            await createAuditLog({
                req,
                action: "UPDATE",
                entity: "Project",
                entityId: String(project._id),
                message: "Project updated",
                details: { status: project.status },
            });

            sendResponse(res, "Project updated successfully", project);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // ASSIGN EMPLOYEES
    async assignEmployeesToProject(req, res) {
        try {
            const { employeeIds } = req.body;
            const { id } = req.params;

            if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
                return sendError(res, "Employee IDs are required", 400);
            }

            const project = await Project.findOne({
                _id: id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!project) return sendError(res, "Project not found", 404);

            const isProjectLeader =
                req.user.teamLeader &&
                project.teamLeader &&
                project.teamLeader.toString() === req.user.userId;
            const canManage =
                req.user.role === "Admin" ||
                req.user.role === "HR" ||
                isProjectLeader;
            if (!canManage) {
                return sendError(res, "Not authorized to manage team", 403);
            }

            if (project.teamLocked) {
                return sendError(res, "Team is locked for this project", 400);
            }

            const newEmployees = employeeIds.filter(
                empId => !project.employees.includes(empId)
            );

            const capacity = project.slotCount || 0;
            if (capacity > 0 && project.employees.length + newEmployees.length > capacity) {
                return sendError(res, "Project slot count exceeded", 400);
            }

            const employees = await Employee.find({
                _id: { $in: newEmployees },
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            })
                .select("projectWorking maxActiveProjects role isActive teamLeader");

            if (employees.length !== newEmployees.length) {
                return sendError(res, "One or more employees not found", 404);
            }

            const invalidEmployees = employees.filter(emp => {
                const maxProjects = emp.maxActiveProjects || 2;
                const currentCount = (emp.projectWorking || []).length;
                return emp.role !== "Employee" || emp.teamLeader || currentCount >= maxProjects;
            });

            if (invalidEmployees.length > 0) {
                return sendError(
                    res,
                    "One or more employees are not eligible for assignment",
                    400,
                );
            }

            project.employees.push(...newEmployees);
            await project.save();

            await Employee.updateMany(
                {
                    _id: { $in: newEmployees },
                    ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                },
                { $addToSet: { projectWorking: project._id } },
            );

            await createAuditLog({
                req,
                action: "ASSIGN",
                entity: "Project",
                entityId: String(project._id),
                message: "Employees assigned to project",
                details: { employees: newEmployees.map(String) },
            });

            await notifyRecipients({
                recipients: newEmployees,
                title: "Project Assignment",
                message: `You have been assigned to the project "${project.projectName}".`,
                type: "PROJECT_ASSIGNED",
                referenceId: project._id,
            });

            if (global.io) {
                global.io.emit("project:assigned", {
                    projectId: project._id,
                    employeeIds: newEmployees,
                });
            }

            sendResponse(res, "Employees assigned successfully", project);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // UNASSIGN EMPLOYEES
    async unassignEmployeesFromProject(req, res) {
        try {
            const { employeeIds } = req.body;
            const { id } = req.params;

            const project = await Project.findOne({
                _id: id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!project) return sendError(res, "Project not found", 404);

            const isProjectLeader =
                req.user.teamLeader &&
                project.teamLeader &&
                project.teamLeader.toString() === req.user.userId;
            const canManage =
                req.user.role === "Admin" ||
                req.user.role === "HR" ||
                isProjectLeader;
            if (!canManage) {
                return sendError(res, "Not authorized to manage team", 403);
            }

            if (project.teamLocked) {
                return sendError(res, "Team is locked for this project", 400);
            }

            project.employees = project.employees.filter(
                empId => !employeeIds.includes(empId.toString())
            );

            await project.save();

            await Employee.updateMany(
                {
                    _id: { $in: employeeIds },
                    ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                },
                { $pull: { projectWorking: project._id } },
            );

            await createAuditLog({
                req,
                action: "UNASSIGN",
                entity: "Project",
                entityId: String(project._id),
                message: "Employees unassigned from project",
                details: { employees: employeeIds.map(String) },
            });

            await notifyRecipients({
                recipients: employeeIds,
                title: "Project Unassignment",
                message: `You have been removed from the project "${project.projectName}".`,
                type: "PROJECT_UNASSIGNED",
                referenceId: project._id,
            });

            if (global.io) {
                global.io.emit("project:unassigned", {
                    projectId: project._id,
                    employeeIds,
                });
            }

            sendResponse(res, "Employees unassigned successfully", project);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // DASHBOARD
    async getMyDashboardProjects(req, res) {
        try {
            const { userId, role } = req.user || {};
            if (!userId) {
                return sendError(res, "User not found in token", 401);
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return sendError(res, "Invalid user id", 401);
            }

            const baseProjectFilter = req.user?.companyId
                ? { companyId: req.user.companyId }
                : {};
            const leadProjectsPromise = Project.find({ teamLeader: userId, ...baseProjectFilter })
                .populate("teamLeader", "name employeeId")
                .populate("employees", "name employeeId");

            const memberProjectsPromise =
                role === "Employee" || role === "TeamLeader"
                    ? Project.find({ employees: userId, ...baseProjectFilter })
                        .populate("teamLeader", "name employeeId")
                        .populate("employees", "name employeeId")
                    : Promise.resolve([]);

            const [leadProjects, memberProjects] = await Promise.all([
                leadProjectsPromise,
                memberProjectsPromise,
            ]);

            const allProjects = [...leadProjects, ...memberProjects];

            const unique = new Map();
            allProjects.forEach((proj) => {
                unique.set(String(proj._id), proj);
            });

            sendResponse(res, "Dashboard projects fetched", Array.from(unique.values()));
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new ProjectController();
