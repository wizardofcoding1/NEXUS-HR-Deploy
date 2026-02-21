const Attendance = require("../models/attandanceSchema");
const AttendancePolicy = require("../models/attendancePolicyModel");
const Employee = require("../models/employeeModel");
const { createAuditLog } = require("../utils/auditLogger");
const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");

const DEFAULT_POLICY = {
    shiftType: "Fixed",
    shiftRules: {
        Morning: { start: "09:00", end: "18:00", breakMinutes: 60, breakPaid: false, graceMinutes: 10 },
        Evening: { start: "13:00", end: "22:00", breakMinutes: 60, breakPaid: false, graceMinutes: 10 },
        Night: { start: "21:00", end: "06:00", breakMinutes: 60, breakPaid: false, graceMinutes: 10 },
    },
    flexibleShift: { requiredHours: 9, graceMinutes: 15 },
    overtime: { enabled: true, startAfterMinutes: 30, rateMultiplier: 1.5 },
    lateRule: { enabled: true, lateToHalfDayCount: 3 },
    earlyOutRule: { enabled: true, deductByMinutes: true },
    minHalfDayHours: 4,
    minFullDayHours: 8,
    absentAutoMarkTime: "12:00",
    consecutiveAbsentThreshold: 3,
};

const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

const getPolicy = async (companyId) => {
    const policy = await AttendancePolicy.findOne(
        companyId ? { companyId } : {}
    );
    if (policy) return policy;
    return DEFAULT_POLICY;
};

const getShiftRule = (policy, shiftKey) =>
    policy.shiftRules?.[shiftKey] || DEFAULT_POLICY.shiftRules.Morning;

const getShiftMinutes = (shiftRule) => {
    const shiftStartMinutes = timeToMinutes(shiftRule.start);
    let shiftEndMinutes = timeToMinutes(shiftRule.end);
    const crossesMidnight = shiftEndMinutes < shiftStartMinutes;
    if (crossesMidnight) shiftEndMinutes += 1440;
    return { shiftStartMinutes, shiftEndMinutes, crossesMidnight };
};

const applyCheckout = (attendance, employee, policy, shiftRule, checkOutTime) => {
    const { shiftStartMinutes, shiftEndMinutes, crossesMidnight } = getShiftMinutes(shiftRule);

    attendance.checkOut = checkOutTime;

    const diffMs = attendance.checkOut - attendance.checkIn;
    let workedMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    if (employee.shiftType === "Fixed" && !shiftRule.breakPaid) {
        workedMinutes = Math.max(0, workedMinutes - shiftRule.breakMinutes);
    }

    attendance.workedMinutes = workedMinutes;

    let checkInMinutes = attendance.checkIn.getHours() * 60 + attendance.checkIn.getMinutes();
    let checkOutMinutes = attendance.checkOut.getHours() * 60 + attendance.checkOut.getMinutes();
    if (crossesMidnight) {
        if (checkInMinutes < shiftStartMinutes) checkInMinutes += 1440;
        if (checkOutMinutes < shiftStartMinutes) checkOutMinutes += 1440;
    }

    if (employee.shiftType === "Fixed") {
        attendance.lateIn =
            policy.lateRule?.enabled &&
            checkInMinutes > shiftStartMinutes + (shiftRule.graceMinutes || 0);

        attendance.earlyOut =
            policy.earlyOutRule?.enabled && checkOutMinutes < shiftEndMinutes;

        if (policy.overtime?.enabled && checkOutMinutes > shiftEndMinutes + policy.overtime.startAfterMinutes) {
            attendance.overtimeMinutes = checkOutMinutes - shiftEndMinutes;
        } else {
            attendance.overtimeMinutes = 0;
        }
    } else {
        attendance.lateIn = false;
        attendance.earlyOut = false;
        if (policy.overtime?.enabled && workedMinutes > policy.flexibleShift.requiredHours * 60 + policy.overtime.startAfterMinutes) {
            attendance.overtimeMinutes =
                workedMinutes - policy.flexibleShift.requiredHours * 60;
        } else {
            attendance.overtimeMinutes = 0;
        }
    }

    const workedHours = workedMinutes / 60;
    if (employee.shiftType === "Flexible") {
        if (workedHours >= policy.flexibleShift.requiredHours) {
            attendance.status = "Full-Day";
        } else if (workedHours >= policy.minHalfDayHours) {
            attendance.status = "Half-Day";
        } else {
            attendance.status = "Absent";
        }
    } else {
        if (workedHours >= policy.minFullDayHours) {
            attendance.status = "Full-Day";
        } else if (workedHours >= policy.minHalfDayHours) {
            attendance.status = "Half-Day";
        } else {
            attendance.status = "Absent";
        }
    }
};

const applyLatePenalty = async (attendance, employeeId, policy, companyId) => {
    if (policy.lateRule?.enabled && attendance.lateIn) {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        const lateCount = await Attendance.countDocuments({
            employee: employeeId,
            lateIn: true,
            date: { $gte: start },
            ...(companyId ? { companyId } : {}),
        });
        if (lateCount >= policy.lateRule.lateToHalfDayCount) {
            attendance.status = "Half-Day";
        }
    }
};

const ensureAbsentForDate = async (date, policy, companyId) => {
    const [hour, minute] = (policy.absentAutoMarkTime || "12:00")
        .split(":")
        .map(Number);
    const now = new Date();
    const markTime = new Date(date);
    markTime.setHours(hour, minute, 0, 0);
    if (now < markTime) return;

    const employees = await Employee.find({
        role: { $in: ["Employee", "TeamLeader", "HR"] },
        ...(companyId ? { compnayId: companyId } : {}),
    }).select("_id compnayId");

    const employeeIds = employees.map((e) => e._id);
    if (!employeeIds.length) return;

    const existing = await Attendance.find({
        employee: { $in: employeeIds },
        date,
        ...(companyId ? { companyId } : {}),
    }).select("employee");

    const existingSet = new Set(existing.map((rec) => String(rec.employee)));
    const missing = employeeIds.filter((id) => !existingSet.has(String(id)));

    if (!missing.length) return;

    const companyByEmployee = new Map(
        employees.map((emp) => [String(emp._id), emp.compnayId])
    );
    const records = missing.map((id) => ({
        employee: id,
        companyId: companyId || companyByEmployee.get(String(id)),
        date,
        status: "Absent",
    }));

    await Attendance.insertMany(records);
};

const ensureAutoCheckoutForDate = async (date, policy, companyId) => {
    const now = new Date();

    const records = await Attendance.find({
        date,
        checkIn: { $ne: null },
        $or: [{ checkOut: null }, { checkOut: { $exists: false } }],
        ...(companyId ? { companyId } : {}),
    }).populate("employee", "shift shiftType");

    if (!records.length) return;

    for (const attendance of records) {
        const employee = attendance.employee;
        if (!employee) continue;

        const shiftKey = employee.shift || "Morning";
        const shiftRule = getShiftRule(policy, shiftKey);
        const { shiftStartMinutes, shiftEndMinutes, crossesMidnight } = getShiftMinutes(shiftRule);

        let autoCheckoutTime = null;

        if (employee.shiftType === "Flexible") {
            const hours = policy.flexibleShift?.requiredHours || DEFAULT_POLICY.flexibleShift.requiredHours;
            autoCheckoutTime = new Date(attendance.checkIn);
            autoCheckoutTime.setMinutes(autoCheckoutTime.getMinutes() + hours * 60);
        } else {
            autoCheckoutTime = new Date(date);
            const endMinutes = shiftEndMinutes % 1440;
            const endHour = Math.floor(endMinutes / 60);
            const endMinute = endMinutes % 60;
            autoCheckoutTime.setHours(endHour, endMinute, 0, 0);
            if (crossesMidnight) {
                autoCheckoutTime.setDate(autoCheckoutTime.getDate() + 1);
            }
        }

        if (!autoCheckoutTime || now < autoCheckoutTime) continue;

        applyCheckout(attendance, employee, policy, shiftRule, autoCheckoutTime);
        await applyLatePenalty(attendance, employee._id, policy, companyId);
        await attendance.save();

        if (global.io) {
            global.io.emit("attendance:checkout", {
                employeeId: employee._id,
                date: attendance.date,
                checkOut: attendance.checkOut,
            });
            global.io.to(String(employee._id)).emit("attendance:self", {
                status: "CHECKED_OUT",
                time: attendance.checkOut,
            });
        }
    }
};

const emitConsecutiveAbsenceAlerts = async (policy, companyId) => {
    if (!global.io) return;
    const threshold = policy.consecutiveAbsentThreshold || 3;
    if (threshold < 1) return;

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - (threshold - 1));

    const employees = await Employee.find({
        role: { $in: ["Employee", "TeamLeader", "HR"] },
        ...(companyId ? { compnayId: companyId } : {}),
    }).select("_id name employeeId");

    for (const emp of employees) {
        const records = await Attendance.find({
            employee: emp._id,
            date: { $gte: start, $lte: end },
            ...(companyId ? { companyId } : {}),
        }).sort({ date: 1 });

        if (records.length < threshold) continue;
        const allAbsent = records.every((rec) => rec.status === "Absent");
        if (allAbsent) {
            global.io.emit("attendance:alert", {
                employeeId: emp._id,
                employeeName: emp.name,
                employeeCode: emp.employeeId,
                message: `Absent for ${threshold} consecutive days`,
            });
        }
    }
};

class AttendanceController {
    // =====================
    // CHECK-IN / CHECK-OUT
    // =====================
    async markAttendance(req, res) {
        try {
            const employeeId = req.user.userId;
            const employee = await Employee.findById(employeeId);
            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            const policy = await getPolicy(req.user.companyId);
            const shiftKey = employee.shift || "Morning";
            const shiftRule = getShiftRule(policy, shiftKey);

            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const { shiftStartMinutes, shiftEndMinutes, crossesMidnight } = getShiftMinutes(shiftRule);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find today's attendance
            let attendance = await Attendance.findOne({
                employee: employeeId,
                date: today,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });

            // 🟢 CHECK-IN
            if (!attendance) {
                if (employee.shiftType === "Fixed") {
                    const windowStart = Math.max(0, shiftStartMinutes - 60);
                    const windowEnd = shiftEndMinutes;
                    const adjustedNow = crossesMidnight && nowMinutes < shiftStartMinutes
                        ? nowMinutes + 1440
                        : nowMinutes;
                    if (adjustedNow < windowStart || adjustedNow > windowEnd) {
                        return sendError(
                            res,
                            `Check-in allowed only between ${shiftRule.start} and ${shiftRule.end}`,
                            400,
                        );
                    }
                }

                attendance = await Attendance.create({
                    employee: employeeId,
                    companyId: req.user.companyId,
                    date: today,
                    checkIn: new Date(),
                    status: "Present",
                });

                await createAuditLog({
                    req,
                    action: "CHECK_IN",
                    entity: "Attendance",
                    entityId: String(attendance._id),
                    message: "Employee checked in",
                });

                // 🔔 SOCKET: notify HR & Admin
                if (global.io) {
                    global.io.emit("attendance:checkin", {
                        employeeId,
                        date: attendance.date,
                        checkIn: attendance.checkIn,
                    });

                    // Notify employee
                    global.io.to(employeeId).emit("attendance:self", {
                        status: "CHECKED_IN",
                        time: attendance.checkIn,
                    });
                }

                return sendResponse(
                    res,
                    "Checked in successfully",
                    attendance,
                );
            }

            // 🟠 CHECK-OUT
            if (!attendance.checkOut) {
                applyCheckout(attendance, employee, policy, shiftRule, new Date());
                await applyLatePenalty(attendance, employeeId, policy, req.user.companyId);

                await attendance.save();

                await createAuditLog({
                    req,
                    action: "CHECK_OUT",
                    entity: "Attendance",
                    entityId: String(attendance._id),
                    message: "Employee checked out",
                    details: {
                        workedMinutes: attendance.workedMinutes,
                        status: attendance.status,
                        lateIn: attendance.lateIn,
                        earlyOut: attendance.earlyOut,
                        overtimeMinutes: attendance.overtimeMinutes,
                    },
                });

                // 🔔 SOCKET: notify HR & Admin
                if (global.io) {
                    global.io.emit("attendance:checkout", {
                        employeeId,
                        date: attendance.date,
                        checkOut: attendance.checkOut,
                    });

                    // Notify employee
                    global.io.to(employeeId).emit("attendance:self", {
                        status: "CHECKED_OUT",
                        time: attendance.checkOut,
                    });
                }

                return sendResponse(
                    res,
                    "Checked out successfully",
                    attendance,
                );
            }

            // ❌ Already checked out
            return sendError(
                res,
                "Attendance already completed for today",
                400,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =====================
    // GET EMPLOYEE ATTENDANCE
    // =====================
    async getAttendanceByEmployee(req, res) {
        try {
            const query = {
                employee: req.params.employeeId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            };
            if (req.query.date) {
                const date = new Date(req.query.date);
                date.setHours(0, 0, 0, 0);
                query.date = date;
                const policy = await getPolicy(req.user.companyId);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date.getTime() === today.getTime()) {
                    await ensureAbsentForDate(date, policy, req.user.companyId);
                    await ensureAutoCheckoutForDate(date, policy, req.user.companyId);
                }
            } else if (req.query.month) {
                const [year, month] = req.query.month.split("-").map(Number);
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 1);
                query.date = { $gte: start, $lt: end };
            }

            const records = await Attendance.find(query).sort({ date: -1 });

            sendResponse(
                res,
                "Attendance records fetched",
                records,
                records.length,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =====================
    // GET MY ATTENDANCE
    // =====================
    async getMyAttendance(req, res) {
        try {
            const query = {
                employee: req.user.userId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            };
            if (req.query.date) {
                const date = new Date(req.query.date);
                date.setHours(0, 0, 0, 0);
                query.date = date;
                const policy = await getPolicy(req.user.companyId);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date.getTime() === today.getTime()) {
                    await ensureAbsentForDate(date, policy, req.user.companyId);
                    await ensureAutoCheckoutForDate(date, policy, req.user.companyId);
                }
            } else if (req.query.month) {
                const [year, month] = req.query.month.split("-").map(Number);
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 1);
                query.date = { $gte: start, $lt: end };
            }

            const records = await Attendance.find(query).sort({ date: -1 });

            sendResponse(
                res,
                "My attendance records fetched",
                records,
                records.length,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =====================
    // GET POLICY (ADMIN/HR)
    // =====================
    async getPolicy(req, res) {
        try {
            const policy = await AttendancePolicy.findOne(
                req.user?.companyId ? { companyId: req.user.companyId } : {}
            );
            sendResponse(
                res,
                "Attendance policy fetched",
                policy || DEFAULT_POLICY,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =====================
    // UPDATE POLICY (ADMIN)
    // =====================
    async updatePolicy(req, res) {
        try {
            const updates = req.body || {};
            let policy = await AttendancePolicy.findOne(
                req.user?.companyId ? { companyId: req.user.companyId } : {}
            );
            if (!policy) {
                policy = await AttendancePolicy.create({
                    ...DEFAULT_POLICY,
                    ...updates,
                    companyId: req.user?.companyId,
                });
            } else {
                Object.assign(policy, updates);
                await policy.save();
            }

            sendResponse(
                res,
                "Attendance policy updated",
                policy,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }
    // =====================
    // GET ALL ATTENDANCE (HR)
    // =====================
    async getAllAttendance(req, res) {
        try {
            // Optional: Filter by date if query param exists
            const query = {};
            if (req.user?.companyId) {
                query.companyId = req.user.companyId;
            }
            if (req.query.date) {
                const date = new Date(req.query.date);
                date.setHours(0, 0, 0, 0);
                query.date = date;
                const policy = await getPolicy(req.user.companyId);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date.getTime() === today.getTime()) {
                    await ensureAbsentForDate(date, policy, req.user.companyId);
                    await ensureAutoCheckoutForDate(date, policy, req.user.companyId);
                    await emitConsecutiveAbsenceAlerts(policy, req.user.companyId);
                }
            } else if (req.query.month) {
                const [year, month] = req.query.month.split("-").map(Number);
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 1);
                query.date = { $gte: start, $lt: end };
            }

            const records = await Attendance.find(query)
                .populate("employee", "name email role") // Populate employee info
                .sort({ date: -1 });

            sendResponse(
                res,
                "All attendance records fetched",
                records,
                records.length,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new AttendanceController();
