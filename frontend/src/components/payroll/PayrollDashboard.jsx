import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPayrollPayment,
    getPayrolls,
    markPayrollPaid,
} from "../../services/payrollService";
import { downloadPayslipPdf } from "../../utils/payslipPdf";
import { getAllEmployees } from "../../services/employeeService";
import { getAllAttendance } from "../../services/attendanceService";
import { getAllBankDetails } from "../../services/bankDetailsService";

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const formatMoney = (value) => money.format(Number(value || 0));
const getMonthKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};
const getMonthLabelFromKey = (monthKey) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split("-").map(Number);
    const label = new Date(year, month - 1, 1).toLocaleString("en-US", {
        month: "short",
    });
    return `${label}-${year}`;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};
const daysBetween = (from, to) => {
    const fromDay = startOfDay(from);
    const toDay = startOfDay(to);
    const diff = toDay.getTime() - fromDay.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const PayrollDashboard = ({ variant = "admin" }) => {
    const isAdmin = variant === "admin";
    const headerSubtitle = isAdmin
        ? "Manage payouts, track history, and generate payslips."
        : "Process salaries and manage payment history.";
    const filterLabel = isAdmin ? "Filter Month:" : "Period:";
    const overdueTitle = isAdmin ? "Action Required" : "Attention Required";
    const pendingTitle = isAdmin ? "Pending Payments" : "To Pay This Month";
    const pendingBadgeLabel = isAdmin ? "Records" : "Pending";
    const pendingEmptyText = isAdmin
        ? "All caught up! No pending payments."
        : "All caught up! No pending payrolls.";
    const paidEmptyText = isAdmin
        ? "No payment history available for this month."
        : "No payment history found.";
    const markPaidLabel = isAdmin ? "Mark as Paid" : "Mark Paid";
    const payslipLabel = isAdmin ? "Download" : "PDF";

    const [payrolls, setPayrolls] = useState([]);
    const [overdueCount, setOverdueCount] = useState(0);
    const [month, setMonth] = useState("");
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [bankDetails, setBankDetails] = useState([]);
    const navigate = useNavigate();

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const res = await getPayrolls(month);
            if (res.payrolls) {
                setPayrolls(res.payrolls);
                setOverdueCount(res.overdueCount || 0);
            } else if (Array.isArray(res)) {
                setPayrolls(res);
                setOverdueCount(0);
            } else {
                setPayrolls([]);
            }
        } catch {
            if (!isAdmin) {
                alert("Failed to load payrolls");
            } else {
                setPayrolls([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSupportingData = async () => {
        try {
            const [employeeRes, attendanceRes, bankRes] = await Promise.all([
                getAllEmployees().catch(() => []),
                getAllAttendance({ month: month || getMonthKey() }).catch(() => []),
                getAllBankDetails().catch(() => []),
            ]);
            setEmployees(Array.isArray(employeeRes) ? employeeRes : []);
            setAttendance(Array.isArray(attendanceRes) ? attendanceRes : []);
            setBankDetails(Array.isArray(bankRes) ? bankRes : []);
        } catch {
            setEmployees([]);
            setAttendance([]);
            setBankDetails([]);
        }
    };

    useEffect(() => {
        fetchPayrolls();
        fetchSupportingData();
    }, [month]);

    const handleMarkPaid = async (id) => {
        try {
            await markPayrollPaid(id);
            fetchPayrolls();
        } catch {
            alert(isAdmin ? "Failed to update status" : "Failed to update payroll status");
        }
    };

    const handlePayslipDownload = (payroll) => {
        downloadPayslipPdf({
            payroll,
            salary: null,
            employeeName: payroll.employee?.name || "Employee",
            hrName: payroll.processedBy?.name || "HR Team",
        });
    };

    const handlePayNow = async (row) => {
        try {
            await createPayrollPayment(row.emp._id, "Full");
            fetchPayrolls();
        } catch (error) {
            alert(error?.response?.data?.message || "Payment failed");
        }
    };

    const monthKey = month || getMonthKey();
    const monthLabel = getMonthLabelFromKey(monthKey);

    const pendingPayrolls = useMemo(
        () => payrolls.filter((p) => p.paymentStatus === "Pending" && p.month === monthLabel),
        [payrolls, monthLabel],
    );
    const paidPayrolls = useMemo(
        () => payrolls.filter((p) => p.paymentStatus === "Paid" && p.month === monthLabel),
        [payrolls, monthLabel],
    );

    const attendanceMap = useMemo(() => {
        const map = new Map();
        attendance.forEach((rec) => {
            const employeeId = rec.employee?._id || rec.employee;
            if (!employeeId) return;
            const entry = map.get(employeeId) || {
                paidLeaveDays: 0,
                halfDayLeaves: 0,
                halfPaidLeaveDays: 0,
                halfHalfDayLeaves: 0,
            };
            const date = new Date(rec.date);
            const dayOfMonth = date.getDate();
            if (rec.status === "Absent") {
                entry.paidLeaveDays += 1;
                if (dayOfMonth <= 15) entry.halfPaidLeaveDays += 1;
            } else if (rec.status === "Half-Day") {
                entry.halfDayLeaves += 1;
                if (dayOfMonth <= 15) entry.halfHalfDayLeaves += 1;
            }
            map.set(employeeId, entry);
        });
        return map;
    }, [attendance]);

    const payrollMap = useMemo(() => {
        const map = new Map();
        payrolls.forEach((p) => {
            if (p.month !== monthLabel) return;
            const employeeId = p.employee?._id || p.employee;
            if (!employeeId) return;
            const list = map.get(employeeId) || [];
            list.push(p);
            map.set(employeeId, list);
        });
        return map;
    }, [payrolls, monthLabel]);

    const bankSet = useMemo(() => {
        const set = new Set();
        bankDetails.forEach((detail) => {
            if (detail.employee?._id) set.add(detail.employee._id);
        });
        return set;
    }, [bankDetails]);

    const today = new Date();
    const currentMonthKey = getMonthKey(today);
    const selectedMonthKey = month || currentMonthKey;
    const [selectedYear, selectedMonth] = selectedMonthKey.split("-").map(Number);
    const selectedMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
    const daysInSelectedMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const isCurrentMonth = selectedMonthKey === currentMonthKey;
    const isPastMonth = selectedMonthDate < new Date(today.getFullYear(), today.getMonth(), 1);
    const isFutureMonth = selectedMonthDate > new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOfMonth = isCurrentMonth ? today.getDate() : 0;
    const fullPayGateDay = Math.min(30, daysInSelectedMonth);

    const employeeRows = useMemo(() => {
        return employees
            .filter((emp) => emp.role === "Employee" || emp.role === "TeamLeader")
            .map((emp) => {
                const salary = emp.salary || {};
                const baseSalary =
                    Number(salary.basic || 0) +
                    Number(salary.hra || 0) +
                    Number(salary.allowances || 0);
                const paidLeaveRate = Number(salary.paidLeaveDeduction || 0);
                const halfDayRate = Number(salary.halfDayDeduction || 0);
                const pf = Number(salary.deductions?.pf || 0);
                const tax = Number(salary.deductions?.tax || 0);

                const leave = attendanceMap.get(emp._id) || {
                    paidLeaveDays: 0,
                    halfDayLeaves: 0,
                    halfPaidLeaveDays: 0,
                    halfHalfDayLeaves: 0,
                };

                const monthLeaveDeduction =
                    leave.paidLeaveDays * paidLeaveRate +
                    leave.halfDayLeaves * halfDayRate;
                const fullNet = Math.max(
                    0,
                    baseSalary - monthLeaveDeduction - pf - tax,
                );

                const history = payrollMap.get(emp._id) || [];
                const hasFull = history.some((p) => p.payCycle === "Full");

                const paidRecord = history.find((p) => p.paymentStatus === "Paid");
                const pendingRecord = history.find((p) => p.paymentStatus === "Pending");

                const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
                const joinDay = joinDate ? joinDate.getDate() : 1;
                const cycleEnd = new Date(selectedYear, selectedMonth - 1, Math.min(joinDay, daysInSelectedMonth), 23, 59, 59, 999);
                const payoutDate = addDays(cycleEnd, 2);
                const payoutDay = startOfDay(payoutDate);
                const todayDay = startOfDay(today);

                const remainingFromSelected = Math.max(0, daysBetween(selectedMonthDate, cycleEnd));
                const remainingFromToday = Math.max(0, daysBetween(today, cycleEnd));

                const remainingDaysValue = isPastMonth
                    ? null
                    : remainingFromToday;

                let statusLabel = isFutureMonth
                    ? `Upcoming (${remainingFromToday} days remaining)`
                    : isCurrentMonth
                        ? `Upcoming (${remainingFromToday} days remaining)`
                        : "Payment Pending";

                if (paidRecord) {
                    statusLabel = `Paid (${paidRecord.referenceId || "Ref pending"})`;
                } else if (pendingRecord) {
                    statusLabel = "Payment Pending";
                } else if (isCurrentMonth && todayDay >= payoutDay) {
                    statusLabel = "Payment Pending";
                } else if (isPastMonth) {
                    statusLabel = "Payment Pending";
                }

                const payoutReady = todayDay >= payoutDay;
                const canPayFull = payoutReady && !hasFull;
                const payable = fullNet;

                const canPay =
                    canPayFull &&
                    bankSet.has(emp._id) &&
                    payable > 0;

                return {
                    emp,
                    baseSalary,
                    deductions: monthLeaveDeduction + pf + tax,
                    netPayable: payable,
                    statusLabel,
                    remainingDays: remainingDaysValue,
                    canPay,
                    hasBank: bankSet.has(emp._id),
                };
            });
    }, [
        employees,
        attendanceMap,
        payrollMap,
        bankSet,
        isCurrentMonth,
        dayOfMonth,
        daysInSelectedMonth,
        selectedMonthDate,
    ]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
                    <p className="text-sm text-slate-500 mt-1">{headerSubtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <label className="text-sm font-medium text-slate-600 pl-2">{filterLabel}</label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {overdueCount > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-red-800 text-sm">{overdueTitle}</h3>
                        <p className="text-sm text-red-700 mt-1">
                            <span className="font-bold">{overdueCount} payments</span> are overdue by more than 25 days. Please prioritize processing these.
                        </p>
                    </div>
                </div>
            )}

            {!isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{pendingPayrolls.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Requests to be paid</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{paidPayrolls.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Completed transactions</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue</p>
                        <p className="text-3xl font-bold text-rose-600 mt-2">{overdueCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-slate-800">Employee Salary Payouts</h2>
                    <p className="text-xs text-slate-500 mt-1">Pay cycle: {monthLabel || "Current Month"}</p>
                </div>
                <div className="overflow-x-auto">
                    {loading && (
                        <p className="p-8 text-center text-slate-500 animate-pulse">Loading payroll data...</p>
                    )}
                    {!loading && employeeRows.length === 0 && (
                        <p className="p-8 text-center text-slate-500">No employees found.</p>
                    )}
                    {!loading && employeeRows.length > 0 && (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Employee</th>
                                    <th className="px-6 py-3">Base Salary</th>
                                    <th className="px-6 py-3">Deductions</th>
                                    <th className="px-6 py-3">Net Payable</th>
                                    <th className="px-6 py-3">Days Left</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employeeRows.map((row) => (
                                    <tr key={row.emp._id} className="hover:bg-slate-50/80">
                                        <td className="px-6 py-4 font-medium text-slate-900">{row.emp.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{formatMoney(row.baseSalary)}</td>
                                        <td className="px-6 py-4 text-rose-600">-{formatMoney(row.deductions)}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{formatMoney(row.netPayable)}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {row.remainingDays ?? "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{row.statusLabel}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/hr/employee/${row.emp._id}/pay`)}
                                                disabled={!row.canPay}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${row.canPay ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                                                title={!row.hasBank ? "Bank details missing" : ""}
                                            >
                                                Pay Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">{pendingTitle}</h2>
                        <span className={`text-xs bg-amber-100 ${isAdmin ? "text-amber-700" : "text-amber-800"} px-2 py-1 rounded-full font-${isAdmin ? "medium" : "bold"}`}>
                            {pendingPayrolls.length} {pendingBadgeLabel}
                        </span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        {!loading && pendingPayrolls.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-slate-500 italic">{pendingEmptyText}</p>
                            </div>
                        )}
                        {!loading && pendingPayrolls.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Employee</th>
                                        <th className="px-6 py-3">Month</th>
                                        <th className="px-6 py-3">Net Pay</th>
                                        <th className="px-6 py-3">Pay Cycle</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pendingPayrolls.map((pay) => (
                                        <tr key={pay._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{pay.employee.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{pay.month}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-slate-800">{formatMoney(pay.netPay)}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">{pay.payCycle || "Full"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleMarkPaid(pay._id)}
                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                                                >
                                                    {markPaidLabel}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Payment History</h2>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        {!loading && paidPayrolls.length === 0 && (
                            <div className="p-12 text-center text-slate-500 italic">
                                {paidEmptyText}
                            </div>
                        )}
                        {!loading && paidPayrolls.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Employee</th>
                                        <th className="px-6 py-3">Month</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Ref</th>
                                        <th className="px-6 py-3 text-right">Payslip</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paidPayrolls.map((pay) => (
                                        <tr key={pay._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{pay.employee.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{pay.month}</td>
                                            <td className="px-6 py-4 font-medium text-green-700">{formatMoney(pay.netPay)}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">{pay.referenceId || "-"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handlePayslipDownload(pay)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline flex items-center justify-end gap-1 w-full"
                                                >
                                                    {payslipLabel}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollDashboard;
