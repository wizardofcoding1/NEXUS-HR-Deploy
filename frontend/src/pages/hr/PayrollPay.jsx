import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getEmployeeById } from "../../services/employeeService";
import { getAttendanceByEmployee } from "../../services/attendanceService";
import { createPayrollPayment } from "../../services/payrollService";

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

const PayrollPay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [referenceId, setReferenceId] = useState("");

    const monthKey = useMemo(() => getMonthKey(), []);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [empRes, attRes] = await Promise.all([
                    getEmployeeById(id).catch(() => null),
                    getAttendanceByEmployee(id, { month: monthKey }).catch(() => []),
                ]);
                setEmployee(empRes);
                setAttendance(Array.isArray(attRes) ? attRes : []);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, monthKey]);

    const salary = employee?.salary || {};

    const baseSalary =
        Number(salary.basic || 0) +
        Number(salary.hra || 0) +
        Number(salary.allowances || 0);

    const paidLeaveRate = Number(salary.paidLeaveDeduction || 0);
    const halfDayRate = Number(salary.halfDayDeduction || 0);
    const pf = Number(salary.deductions?.pf || 0);
    const tax = Number(salary.deductions?.tax || 0);

    const leaveCounts = useMemo(() => {
        const counts = { paidLeaveDays: 0, halfDayLeaves: 0 };
        attendance.forEach((rec) => {
            if (rec.status === "Absent") counts.paidLeaveDays += 1;
            else if (rec.status === "Half-Day") counts.halfDayLeaves += 1;
        });
        return counts;
    }, [attendance]);

    const paidLeaveDeduction = leaveCounts.paidLeaveDays * paidLeaveRate;
    const halfDayDeduction = leaveCounts.halfDayLeaves * halfDayRate;
    const leaveDeduction = paidLeaveDeduction + halfDayDeduction;

    const totalDeductions = leaveDeduction + pf + tax;
    const netPayable = Math.max(0, baseSalary - totalDeductions);

    const handlePay = async () => {
        if (!id) return;
        try {
            setPaying(true);
            setCompleted(false);
            setReferenceId("");
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const res = await createPayrollPayment(id, "Full");
            setReferenceId(res?.referenceId || "");
            setCompleted(true);
        } catch (error) {
            alert(error?.response?.data?.message || "Payment failed");
        } finally {
            setPaying(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto pb-10 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h1 className="text-2xl font-bold text-slate-800">Payroll Payment</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Employee ID: <span className="font-mono text-slate-700">{id}</span>
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                        Loading payment details...
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Employee</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {employee?.name || "Unknown"} • {employee?.department || "Department"} • {employee?.position || "Role"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <p className="text-xs font-bold text-slate-400 uppercase">Base Salary</p>
                                <p className="text-xl font-bold text-slate-800 mt-1">{formatMoney(baseSalary)}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <p className="text-xs font-bold text-slate-400 uppercase">Net Payable</p>
                                <p className="text-xl font-bold text-emerald-700 mt-1">{formatMoney(netPayable)}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-3">Deductions</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Paid Leaves ({leaveCounts.paidLeaveDays})</span>
                                    <span className="text-rose-600">-{formatMoney(paidLeaveDeduction)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Half Days ({leaveCounts.halfDayLeaves})</span>
                                    <span className="text-rose-600">-{formatMoney(halfDayDeduction)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Provident Fund (PF)</span>
                                    <span className="text-rose-600">-{formatMoney(pf)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tax</span>
                                    <span className="text-rose-600">-{formatMoney(tax)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                                    <span className="text-slate-700">Total Deductions</span>
                                    <span className="text-slate-800">-{formatMoney(totalDeductions)}</span>
                                </div>
                            </div>
                        </div>

                        {completed && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3 text-sm">
                                <p className="font-semibold">Payment Completed</p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    {referenceId ? `Reference: ${referenceId}` : "Reference will appear in payroll history."}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handlePay}
                                disabled={paying || netPayable <= 0 || completed}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${paying || netPayable <= 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                            >
                                {paying ? "Processing..." : completed ? "Paid" : "Pay"}
                            </button>
                            <Link
                                to="/hr/payroll"
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Back to Payroll
                            </Link>
                            {completed && (
                                <button
                                    onClick={() => navigate("/hr/payroll")}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    View History
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default PayrollPay;
