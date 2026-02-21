const Leave = require("../models/leaveSchema");
const Project = require("../models/projectSchema");
const Payroll = require("../models/payrollSchema");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attandanceSchema");
const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");

class DashboardController {
    async getHRStats(req, res) {
        try {
            // Parallelize queries for performance
            const [
                pendingLeavesCount,
                upcomingProjectsCount,
                pendingPayrollCount,
                totalEmployees
            ] = await Promise.all([
                Leave.countDocuments({
                    status: "Pending",
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                }),
                Project.countDocuments({
                    startDate: { $gt: new Date() },
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                }),
                Payroll.countDocuments({
                    paymentStatus: "Pending",
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                }),
                Employee.countDocuments({
                    role: "Employee",
                    isActive: true,
                    ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
                })
            ]);

            const stats = {
                pendingLeaves: pendingLeavesCount,
                upcomingProjects: upcomingProjectsCount,
                pendingPayrolls: pendingPayrollCount,
                activeEmployees: totalEmployees
            };

            sendResponse(res, "Dashboard Stats Fetched", stats);
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getDashboardCharts(req, res) {
        try {
            // 1. Attendance Data (Last 7 Days)
            const attendanceData = [];
            
            // Loop for last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                
                // Start & End of day
                const start = new Date(d);
                start.setHours(0, 0, 0, 0);
                const end = new Date(d);
                end.setHours(23, 59, 59, 999);
                
                // Count distinct employees present
                const count = await Attendance.distinct("employee", {
                    date: { $gte: start, $lte: end },
                    status: { $in: ["Present", "Full-Day", "Half-Day"] },
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                }).then((rows) => rows.length);

                attendanceData.push({
                    day: d.toLocaleDateString("en-US", { weekday: "short" }),
                    present: count,
                    absent: 0,
                });
            }

            // 2. Payroll Data (Last 6 Months)
            const payrollData = [];
            for (let i = 5; i >= 0; i--) {
                 const d = new Date();
                 d.setMonth(d.getMonth() - i);
                 const monthName = d.toLocaleDateString("en-US", { month: "short" });
                 const year = d.getFullYear();
                 const monthIndex = d.getMonth(); // 0-11

                 const start = new Date(year, monthIndex, 1);
                 const end = new Date(year, monthIndex + 1, 0);
                 
                 const result = await Payroll.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: start, $lte: end },
                            paymentStatus: "Paid",
                            ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$netPay" }
                        }
                    }
                 ]);

                payrollData.push({
                    month: monthName,
                    amount: result[0]?.total || 0,
                });
            }

            sendResponse(res, "Chart Data Fetched", { attendance: attendanceData, payroll: payrollData });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getProjectTrends(req, res) {
        try {
            const monthsParam = String(req.query.months || "").trim();
            const months = monthsParam
                ? monthsParam.split(",").map((m) => m.trim()).filter(Boolean)
                : [];

            const targetMonths = months.length
                ? months
                : [new Date().toISOString().slice(0, 7)];

            const series = [];

            for (const month of targetMonths) {
                const [yearStr, monthStr] = month.split("-");
                const year = Number(yearStr);
                const monthIndex = Number(monthStr) - 1;
                if (!year || monthIndex < 0 || monthIndex > 11) continue;

                const start = new Date(year, monthIndex, 1);
                const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
                const daysInMonth = end.getDate();

                    const counts = await Project.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: start, $lte: end },
                            ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                        },
                    },
                    {
                        $group: {
                            _id: { $dayOfMonth: "$createdAt" },
                            total: { $sum: 1 },
                        },
                    },
                ]);

                const map = {};
                counts.forEach((c) => {
                    map[c._id] = c.total;
                });

                const days = [];
                for (let d = 1; d <= daysInMonth; d += 1) {
                    days.push({ day: d, count: map[d] || 0 });
                }

                series.push({ month, days });
            }

            sendResponse(res, "Project trends fetched", { series });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async getLeaveTrends(req, res) {
        try {
            const monthsParam = String(req.query.months || "").trim();
            const months = monthsParam
                ? monthsParam.split(",").map((m) => m.trim()).filter(Boolean)
                : [];

            const targetMonths = months.length
                ? months
                : [new Date().toISOString().slice(0, 7)];

            const buildSeries = async (filter) => {
                const series = [];
                for (const month of targetMonths) {
                    const [yearStr, monthStr] = month.split("-");
                    const year = Number(yearStr);
                    const monthIndex = Number(monthStr) - 1;
                    if (!year || monthIndex < 0 || monthIndex > 11) continue;

                    const start = new Date(year, monthIndex, 1);
                    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

                    const rows = await Leave.aggregate([
                        {
                            $match: {
                                ...filter,
                                createdAt: { $gte: start, $lte: end },
                            },
                        },
                        {
                            $group: {
                                _id: "$status",
                                total: { $sum: 1 },
                            },
                        },
                    ]);

                    const data = { month, Pending: 0, Approved: 0, Rejected: 0, total: 0 };
                    rows.forEach((r) => {
                        data[r._id] = r.total;
                        data.total += r.total;
                    });
                    series.push(data);
                }
                return series;
            };

            const overall = await buildSeries(
                req.user?.companyId ? { companyId: req.user.companyId } : {}
            );
            const mine = await buildSeries({ employee: req.user.userId });

            sendResponse(res, "Leave trends fetched", { overall, mine });
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new DashboardController();
