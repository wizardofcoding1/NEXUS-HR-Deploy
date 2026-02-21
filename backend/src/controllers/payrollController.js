const Payroll = require("../models/payrollSchema");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attandanceSchema");

const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");

class PayrollController{
    constructor() {
        this.generatePayroll = this.generatePayroll.bind(this);
        this.getPayrollByEmployee = this.getPayrollByEmployee.bind(this);
        this.getMyPayrolls = this.getMyPayrolls.bind(this);
        this.markPayrollPaid = this.markPayrollPaid.bind(this);
        this.confirmPayrollPaid = this.confirmPayrollPaid.bind(this);
        this.getAllPayrolls = this.getAllPayrolls.bind(this);
        this.createPayrollPayment = this.createPayrollPayment.bind(this);
    }

    getMonthLabel(date = new Date()) {
        const label = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${label}-${year}`;
    }

    getMonthRange(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 1);
        return { start, end };
    }

    getHalfRange(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const start = new Date(year, month, 1);
        const end = new Date(year, month, 16);
        return { start, end };
    }

    countLeaves(records) {
        let paidLeaveDays = 0;
        let halfDayLeaves = 0;
        for (const rec of records) {
            if (rec.status === "Absent") {
                paidLeaveDays += 1;
            } else if (rec.status === "Half-Day") {
                halfDayLeaves += 1;
            }
        }
        return { paidLeaveDays, halfDayLeaves };
    }

    buildReferenceId() {
        return `PAY-${Date.now().toString(36).toUpperCase()}`;
    }

    //Generate Payroll
    async generatePayroll(req, res){
        try{
            const payroll = await Payroll.create({
                ...req.body,
                companyId: req.user?.companyId,
            });
            sendResponse(res, "Payroll Generated Successfully", payroll, null, 201);
        }
        catch(error){
            sendError(res,error.message);
        }
    }

    //Get Payroll By Employee
    async getPayrollByEmployee(req, res){
        try{
            const payrolls = await Payroll.find({
                employee: req.params.employeeId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            })
                .sort({ createdAt: -1 });
            sendResponse(res, "Payroll History Fetched ", payrolls, payrolls.length);
        }catch(error){
            sendError(res, error.message);
        }
    }

    // Get My Payrolls (Employee)
    async getMyPayrolls(req, res){
        try{
            const payrolls = await Payroll.find({
                employee: req.user.userId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            })
                .populate("processedBy", "name")
                .sort({ createdAt: -1 });
            sendResponse(res, "My Payroll History Fetched", payrolls, payrolls.length);
        }catch(error){
            sendError(res, error.message);
        }
    }

    // Mark payroll as paid (HR)
    async markPayrollPaid(req, res){
        try{
            const payroll = await Payroll.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!payroll){
                return sendError(res, "Payroll Not Found", 404);
            }

            payroll.paymentStatus = "Paid";
            payroll.paidOn = new Date();
            payroll.processedBy = req.user.userId;
            if (!payroll.referenceId) {
                payroll.referenceId = this.buildReferenceId();
            }
            await payroll.save();

            const updated = await Payroll.findById(req.params.id)
                .populate("employee", "name email")
                .populate("processedBy", "name");

            sendResponse(res, "Payroll Marked Paid", updated);
        }catch(error){
            sendError(res, error.message);
        }
    }

    // Confirm payroll as paid (Webhook/System)
    async confirmPayrollPaid(req, res){
        try{
            const secret = process.env.PAYROLL_WEBHOOK_SECRET;
            if (!secret) {
                return sendError(res, "Webhook secret not configured", 500);
            }
            const signature = req.headers["x-webhook-signature"];
            const timestamp = req.headers["x-webhook-timestamp"];
            if (!signature || !timestamp) {
                return sendError(res, "Missing webhook signature", 401);
            }
            const now = Date.now();
            const ts = Number(timestamp);
            if (!Number.isFinite(ts) || Math.abs(now - ts) > 5 * 60 * 1000) {
                return sendError(res, "Webhook timestamp expired", 401);
            }

            const rawBody = req.rawBody || Buffer.from("");
            const payload = Buffer.concat([
                Buffer.from(`${timestamp}.`),
                rawBody,
            ]);
            const expected = require("crypto")
                .createHmac("sha256", secret)
                .update(payload)
                .digest("hex");
            const providedSig = String(signature).replace(/^sha256=/, "");
            const expectedBuf = Buffer.from(expected, "utf8");
            const providedBuf = Buffer.from(providedSig, "utf8");
            if (
                expectedBuf.length !== providedBuf.length ||
                !require("crypto").timingSafeEqual(expectedBuf, providedBuf)
            ) {
                return sendError(res, "Invalid webhook signature", 401);
            }

            const payroll = await Payroll.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!payroll){
                return sendError(res, "Payroll Not Found", 404);
            }

            payroll.paymentStatus = "Paid";
            payroll.paidOn = new Date();
            if (req.user?.userId) {
                payroll.processedBy = req.user.userId;
            }
            if (req.body?.referenceId) {
                payroll.referenceId = req.body.referenceId;
            }
            if (!payroll.referenceId) {
                payroll.referenceId = this.buildReferenceId();
            }
            await payroll.save();

            const updated = await Payroll.findById(req.params.id)
                .populate("employee", "name email")
                .populate("processedBy", "name");

            sendResponse(res, "Payroll Payment Confirmed", updated);
        }catch(error){
            sendError(res, error.message);
        }
    }

    // Get All Payrolls (HR)
    async getAllPayrolls(req, res) {
        try {
            const month = String(req.query.month || "").trim();
            let query = {};
            if (req.user?.companyId) {
                query.companyId = req.user.companyId;
            }
            if (month) {
                const monthMatch = month.match(/^(\d{4})-(\d{2})$/);
                if (monthMatch) {
                    const year = Number(monthMatch[1]);
                    const monthIndex = Number(monthMatch[2]) - 1;
                    const label = new Date(year, monthIndex, 1).toLocaleString(
                        "en-US",
                        { month: "short" },
                    );
                    query.month = `${label}-${year}`;
                } else {
                    query.month = month;
                }
            }

            const payrolls = await Payroll.find(query)
                .populate("employee", "name email")
                .populate("processedBy", "name")
                .sort({ createdAt: -1 });
            
            // Check for overdue payments (logic for reminders)
            const today = new Date();
            const pendingAndOverdue = payrolls.filter(p => 
                p.paymentStatus === 'Pending' && 
                new Date(p.createdAt) < new Date(today.setDate(today.getDate() - 25)) // Example: created more than 25 days ago
            );

            sendResponse(res, "All Payrolls Fetched", { payrolls, overdueCount: pendingAndOverdue.length });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // Create payroll payment (HR/Admin)
    async createPayrollPayment(req, res) {
        try {
            const { employeeId, payType } = req.body || {};
            if (!employeeId || !payType) {
                return sendError(res, "Employee and pay type are required", 400);
            }
            if (!["Half", "Full", "Remaining"].includes(payType)) {
                return sendError(res, "Invalid pay type", 400);
            }

            const employee = await Employee.findOne({
                _id: employeeId,
                ...(req.user?.companyId ? { compnayId: req.user.companyId } : {}),
            });
            if (!employee) {
                return sendError(res, "Employee not found", 404);
            }

            const monthLabel = this.getMonthLabel();
            const { start, end } = this.getMonthRange();
            const { start: halfStart, end: halfEnd } = this.getHalfRange();

            const existing = await Payroll.find({
                employee: employeeId,
                month: monthLabel,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });

            const hasHalf = existing.some((p) => p.payCycle === "Half");
            const hasFull = existing.some((p) => p.payCycle === "Full");
            const hasRemaining = existing.some((p) => p.payCycle === "Remaining");
            const alreadyPaid = existing.reduce((sum, p) => sum + Number(p.netPay || 0), 0);

            if (payType === "Half" && (hasHalf || hasFull || hasRemaining)) {
                return sendError(res, "Half month already paid for this cycle", 400);
            }
            if ((payType === "Full" || payType === "Remaining") && (hasFull || hasRemaining)) {
                return sendError(res, "Full month already paid for this cycle", 400);
            }
            if (payType === "Remaining" && !hasHalf) {
                return sendError(res, "Half month payment not found", 400);
            }

            const salary = employee.salary || {};
            const baseSalary =
                Number(salary.basic || 0) +
                Number(salary.hra || 0) +
                Number(salary.allowances || 0);

            const monthAttendance = await Attendance.find({
                employee: employeeId,
                date: { $gte: start, $lt: end },
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            }).select("date status");
            const halfAttendance = await Attendance.find({
                employee: employeeId,
                date: { $gte: halfStart, $lt: halfEnd },
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            }).select("date status");

            const monthLeaves = this.countLeaves(monthAttendance);
            const halfLeaves = this.countLeaves(halfAttendance);

            const paidLeaveRate = Number(salary.paidLeaveDeduction || 0);
            const halfDayRate = Number(salary.halfDayDeduction || 0);
            const pfDeduction = Number(salary.deductions?.pf || 0);
            const taxDeduction = Number(salary.deductions?.tax || 0);

            const monthLeaveDeduction =
                monthLeaves.paidLeaveDays * paidLeaveRate +
                monthLeaves.halfDayLeaves * halfDayRate;
            const halfLeaveDeduction =
                halfLeaves.paidLeaveDays * paidLeaveRate +
                halfLeaves.halfDayLeaves * halfDayRate;
            const monthHalfDayDeduction = monthLeaves.halfDayLeaves * halfDayRate;
            const halfHalfDayDeduction = halfLeaves.halfDayLeaves * halfDayRate;
            const monthPaidLeaveDeduction = monthLeaves.paidLeaveDays * paidLeaveRate;
            const halfPaidLeaveDeduction = halfLeaves.paidLeaveDays * paidLeaveRate;

            let netPay = 0;
            let payCycle = payType;
            let deductions = 0;

            if (payType === "Half") {
                netPay = baseSalary / 2 - halfLeaveDeduction;
                deductions = halfLeaveDeduction;
                if (netPay < 0) netPay = 0;
            } else {
                const fullNet = baseSalary - monthLeaveDeduction - pfDeduction - taxDeduction;
                if (hasHalf) {
                    payCycle = "Remaining";
                    netPay = fullNet - alreadyPaid;
                    if (netPay <= 0) {
                        return sendError(res, "No remaining amount to pay", 400);
                    }
                } else {
                    netPay = fullNet;
                }
                deductions = monthLeaveDeduction + pfDeduction + taxDeduction;
                if (netPay < 0) netPay = 0;
            }

            const payroll = await Payroll.create({
                companyId: req.user?.companyId,
                employee: employeeId,
                month: monthLabel,
                grossSalary: baseSalary,
                deductions,
                netPay,
                paidLeaveDays: payType === "Half" ? halfLeaves.paidLeaveDays : monthLeaves.paidLeaveDays,
                halfDayLeaves: payType === "Half" ? halfLeaves.halfDayLeaves : monthLeaves.halfDayLeaves,
                paidLeaveDeduction: payType === "Half" ? halfPaidLeaveDeduction : monthPaidLeaveDeduction,
                halfDayDeduction: payType === "Half" ? halfHalfDayDeduction : monthHalfDayDeduction,
                payCycle,
                paymentStatus: "Pending",
            });

            const populated = await Payroll.findById(payroll._id)
                .populate("employee", "name email")
                .populate("processedBy", "name");

            sendResponse(res, "Payroll payment created", populated, null, 201);
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new PayrollController();
