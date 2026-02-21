import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
    getAttendanceReport,
    getPayrollReport,
} from "../../services/reportService";

const Reports = () => {
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [payrollMonth, setPayrollMonth] = useState("");

    const [attendance, setAttendance] = useState(null);
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const attendanceRes = await getAttendanceReport(attendanceDate);
            const payrollRes = await getPayrollReport(payrollMonth);

            setAttendance(attendanceRes.data);
            setPayroll(payrollRes.data);
        } catch {
            alert("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [attendanceDate, payrollMonth]);

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">System Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Generate daily attendance insights and payroll summaries.</p>
                </div>

                {/* Filters / Configuration */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Report Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Attendance Date
                            </label>
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border transition-shadow text-slate-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Payroll Month
                            </label>
                            <input
                                type="month"
                                value={payrollMonth}
                                onChange={(e) => setPayrollMonth(e.target.value)}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border transition-shadow text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-4 w-4 bg-slate-200 rounded-full mb-2"></div>
                            <p className="text-slate-500 text-sm">Aggregating report data...</p>
                        </div>
                    </div>
                )}

                {/* Reports Grid */}
                {!loading && attendance && payroll && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Attendance Report Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-slate-800">Attendance Overview</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        For {new Date(attendanceDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                                <div className="col-span-2 bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-slate-800">{attendance.total}</p>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Total Employees</p>
                                </div>
                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-green-700">{attendance.present}</p>
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mt-1">Present</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-red-700">{attendance.absent}</p>
                                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mt-1">Absent</p>
                                </div>
                            </div>
                        </div>

                        {/* Payroll Report Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-slate-800">Payroll Summary</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {payrollMonth ? `For ${new Date(payrollMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}` : "All Time"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                                <div className="col-span-2 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-indigo-700">₹{payroll.totalAmount?.toLocaleString()}</p>
                                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mt-1">Total Disbursed</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-emerald-700">{payroll.paid}</p>
                                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mt-1">Paid Requests</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-amber-700">{payroll.pending}</p>
                                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mt-1">Pending Requests</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Reports;