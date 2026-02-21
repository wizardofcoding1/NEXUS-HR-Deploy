import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getMyEmployeeProfile } from "../../services/employeeService";
import { getMyPayrolls } from "../../services/payrollService";
import { getMyAttendance } from "../../services/attendanceService";
import { useAuthStore } from "../../store/authStore";
import { openPayslip } from "../../utils/payslip";
import { downloadPayslipPdf } from "../../utils/payslipPdf";

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const formatMoney = (value) => money.format(Number(value || 0));
const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-";
const getMonthLabel = (date = new Date()) => {
    const label = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${label}-${year}`;
};

const getMonthKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

const EmployeeSalary = () => {
    const { user } = useAuthStore();
    const [employee, setEmployee] = useState(null);
    const [payrolls, setPayrolls] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSalary = async () => {
        try {
            setLoading(true);
            const [employeeRes, payrollRes] = await Promise.all([
                getMyEmployeeProfile().catch(() => null),
                getMyPayrolls().catch(() => []),
            ]);
            setEmployee(employeeRes);
            setPayrolls(Array.isArray(payrollRes) ? payrollRes : []);
            const monthKey = getMonthKey();
            const attendanceRes = await getMyAttendance({ month: monthKey }).catch(() => []);
            setAttendance(Array.isArray(attendanceRes) ? attendanceRes : []);
        } catch {
            alert("Failed to load salary details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalary();
    }, []);

    const salary = employee?.salary || null;

    const baseSalary = useMemo(() => {
        if (!salary) return 0;
        return (
            Number(salary.basic || 0) +
            Number(salary.hra || 0) +
            Number(salary.allowances || 0)
        );
    }, [salary]);

    const currentMonthLabel = getMonthLabel();
    const currentPayroll = payrolls.find((p) => p.month === currentMonthLabel) || payrolls[0] || null;
    const overtimeRate = currentPayroll?.overtimeRate || salary?.overtimeRate || 0;
    const overtimeAmount = Number((currentPayroll?.overtimeHours || 0) * overtimeRate);
    
    const paidLeaveRate = salary?.paidLeaveDeduction || 0;
    const paidLeaveDeduction = currentPayroll?.paidLeaveDeduction ?? (currentPayroll?.paidLeaveDays || 0) * paidLeaveRate;
    
    const halfDayRate = salary?.halfDayDeduction || 0;
    const halfDayDeduction = currentPayroll?.halfDayDeduction ?? (currentPayroll?.halfDayLeaves || 0) * halfDayRate;

    const grossSalary = currentPayroll?.grossSalary ?? baseSalary + overtimeAmount;
    
    const totalDeductions = currentPayroll?.deductions ?? 
        Number(salary?.deductions?.pf || 0) +
        Number(salary?.deductions?.tax || 0) +
        Number(paidLeaveDeduction || 0) +
        Number(halfDayDeduction || 0);
        
    const receivableSalary = currentPayroll?.netPay ?? grossSalary - totalDeductions;
    
    const pfDeduction = Number(salary?.deductions?.pf || 0);
    const taxDeduction = Number(salary?.deductions?.tax || 0);

    const nextPayInfo = useMemo(() => {
        if (!currentPayroll || currentPayroll.paymentStatus !== "Pending") return null;
        if (!currentPayroll.payDate) return { daysLeft: null };
        
        const today = new Date();
        const payDate = new Date(currentPayroll.payDate);
        const diff = Math.ceil((payDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { daysLeft: diff, payDate };
    }, [currentPayroll]);

    const accruedDays = useMemo(() => {
        if (!attendance.length) return 0;
        return attendance.filter((rec) => rec.status !== "Absent").length;
    }, [attendance]);

    const statusInfo = useMemo(() => {
        if (currentPayroll?.paymentStatus === "Paid") {
            return { label: "Paid", tone: "text-green-700 bg-green-100" };
        }
        if (currentPayroll?.paymentStatus === "Pending") {
            return { label: "Salary Credit Pending", tone: "text-amber-700 bg-amber-100" };
        }
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        if (today.getDate() >= daysInMonth) {
            return { label: "Salary Credit Pending", tone: "text-amber-700 bg-amber-100" };
        }
        return { label: "Salary Date Not Come Yet", tone: "text-slate-600 bg-slate-100" };
    }, [currentPayroll]);

    const handlePayslipDownload = (payroll) => {
        downloadPayslipPdf({
            payroll,
            salary,
            employeeName: user?.name || "Employee",
            hrName: payroll?.processedBy?.name || "HR Team",
        });
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-10 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">My Salary</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Breakdown of earnings, deductions, and payment history.
                        </p>
                    </div>
                    {currentPayroll?.paymentStatus === "Paid" && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => openPayslip({
                                    payroll: currentPayroll,
                                    salary,
                                    employeeName: user?.name || "Employee",
                                    hrName: currentPayroll?.processedBy?.name || "HR Team",
                                })}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Print Slip
                            </button>
                            <button
                                onClick={() => handlePayslipDownload(currentPayroll)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Download PDF
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500 animate-pulse">Loading salary details...</p>
                    </div>
                ) : !salary && payrolls.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">No salary records found for your profile.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* Current Month Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-bold text-slate-800">Current Month</h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {currentMonthLabel}
                                    </p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.tone}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accrued Days</p>
                                    <p className="text-lg font-semibold text-slate-800 mt-1">{accruedDays}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                    <p className="text-sm font-medium text-slate-700 mt-1">{statusInfo.label}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</p>
                                    <p className="text-sm font-medium text-slate-700 mt-1">{currentPayroll?.referenceId || "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Receivable</p>
                                <p className="text-2xl font-bold text-indigo-700 mt-2">{formatMoney(receivableSalary)}</p>
                                <p className="text-xs text-slate-500 mt-1">Post deductions</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Salary</p>
                                <p className="text-2xl font-bold text-slate-800 mt-2">{formatMoney(grossSalary)}</p>
                                <p className="text-xs text-slate-500 mt-1">Base + Allowances + OT</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overtime</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-2">{formatMoney(overtimeAmount)}</p>
                                <p className="text-xs text-slate-500 mt-1">{currentPayroll?.overtimeHours || 0} hrs logged</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Deductions</p>
                                <p className="text-2xl font-bold text-rose-600 mt-2">{formatMoney(totalDeductions)}</p>
                                <p className="text-xs text-slate-500 mt-1">Tax, PF, Leaves</p>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Earnings & Deductions Table */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="font-bold text-slate-800">Monthly Breakdown</h2>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Earnings */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Earnings</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Basic Salary</span>
                                            <span className="font-medium text-slate-900">{formatMoney(salary?.basic)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">HRA</span>
                                            <span className="font-medium text-slate-900">{formatMoney(salary?.hra)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Allowances</span>
                                            <span className="font-medium text-slate-900">{formatMoney(salary?.allowances)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Overtime</span>
                                            <span className="font-medium text-emerald-600">{formatMoney(overtimeAmount)}</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-bold text-slate-800">
                                            <span>Total Earnings</span>
                                            <span>{formatMoney(grossSalary)}</span>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deductions</h3>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Provident Fund (PF)</span>
                                            <span className="font-medium text-slate-900">{formatMoney(pfDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Professional Tax</span>
                                            <span className="font-medium text-slate-900">{formatMoney(taxDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Paid Leaves ({currentPayroll?.paidLeaveDays || 0})</span>
                                            <span className="font-medium text-rose-600">-{formatMoney(paidLeaveDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Half Days ({currentPayroll?.halfDayLeaves || 0})</span>
                                            <span className="font-medium text-rose-600">-{formatMoney(halfDayDeduction)}</span>
                                        </div>
                                        <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between font-bold text-slate-800">
                                            <span>Total Deductions</span>
                                            <span>{formatMoney(totalDeductions)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="font-bold text-slate-800 mb-4">Payment Status</h2>
                                    
                                    {currentPayroll ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Cycle</span>
                                                <span className="text-sm font-medium text-slate-800">{currentPayroll.month || "Current Month"}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Status</span>
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                                                    ${currentPayroll.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {currentPayroll.paymentStatus}
                                                </span>
                                            </div>
                                            {currentPayroll.paymentStatus === 'Paid' && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-500">Processed On</span>
                                                    <span className="text-sm font-medium text-slate-800">{formatDate(currentPayroll.paidOn)}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No payroll generated for this cycle yet.</p>
                                    )}
                                </div>

                                {nextPayInfo && (
                                    <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                                        <h2 className="font-bold text-indigo-900 mb-2">Upcoming Payday</h2>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-indigo-600">{nextPayInfo.daysLeft}</span>
                                            <span className="text-indigo-600 font-medium">days left</span>
                                        </div>
                                        <p className="text-xs text-indigo-400 mt-2">
                                            Scheduled for {nextPayInfo.payDate ? formatDate(nextPayInfo.payDate) : "end of month"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">Salary History</h2>
                            </div>
                            
                            <div className="overflow-x-auto">
                                {payrolls.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Month</th>
                                                <th className="px-6 py-4">Base</th>
                                                <th className="px-6 py-4">Overtime</th>
                                                <th className="px-6 py-4">Deductions</th>
                                                <th className="px-6 py-4">Net Pay</th>
                                                <th className="px-6 py-4">Cycle</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                        {payrolls.map((payroll) => {
                                                const ot = (payroll.overtimeHours || 0) * (payroll.overtimeRate || overtimeRate);
                                                const leaveDed = (payroll.paidLeaveDeduction ?? (payroll.paidLeaveDays || 0) * paidLeaveRate) +
                                                                 (payroll.halfDayDeduction ?? (payroll.halfDayLeaves || 0) * halfDayRate);
                                                const gross = payroll.grossSalary ?? baseSalary + ot;
                                                const net = payroll.netPay ?? gross - (payroll.deductions || 0);

                                                return (
                                                    <tr key={payroll._id} className="hover:bg-slate-50/80">
                                                        <td className="px-6 py-4 font-medium text-slate-800">{payroll.month || "-"}</td>
                                                        <td className="px-6 py-4 text-slate-600">{formatMoney(baseSalary)}</td>
                                                        <td className="px-6 py-4 text-slate-600">{formatMoney(ot)}</td>
                                                        <td className="px-6 py-4 text-rose-600">-{formatMoney(leaveDed)}</td>
                                                        <td className="px-6 py-4 font-bold text-indigo-700">{formatMoney(net)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                                                ${payroll.payCycle === 'Half' ? 'bg-blue-100 text-blue-700' :
                                                                  payroll.payCycle === 'Remaining' ? 'bg-violet-100 text-violet-700' :
                                                                  'bg-slate-100 text-slate-700'}`}>
                                                                {payroll.payCycle || "Full"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                                                ${payroll.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {payroll.paymentStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {payroll.paymentStatus === "Paid" && (
                                                                <button
                                                                    onClick={() => handlePayslipDownload(payroll)}
                                                                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline"
                                                                >
                                                                    Download
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="p-8 text-center text-slate-500">No payment history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default EmployeeSalary;
