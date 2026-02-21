import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
    getAllAttendance,
    getAttendancePolicy,
    updateAttendancePolicy,
} from "../../services/attendanceService";
import { getSocket } from "../../services/socket";
import { toastError, toastSuccess } from "../../utils/toast";
import TableSkeleton from "../../components/ui/TableSkeleton";
import useAsync from "../../hooks/useAsync";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from "recharts";

const AttendanceReports = () => {
    const [records, setRecords] = useState([]);
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [policy, setPolicy] = useState(null);

    const attendanceLoader = useAsync(async (nextDate) => {
        const records = await getAllAttendance({ date: nextDate || date });
        setRecords(records);
    });

    const policyLoader = useAsync(async () => {
        const res = await getAttendancePolicy();
        setPolicy(res.data);
    });
    const savePolicy = useAsync(async (nextPolicy) => {
        await updateAttendancePolicy(nextPolicy);
    });

    useEffect(() => {
        attendanceLoader.run(date).catch(() => toastError("Failed To load attendance"));
        policyLoader.run().catch(() => {});
    }, [date]);

    // 🔴 Real-time updates
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const refresh = () => attendanceLoader.run(date).catch(() => {});

        socket.on("attendance:checkin", refresh);
        socket.on("attendance:checkout", refresh);

        return () => {
            socket.off("attendance:checkin", refresh);
            socket.off("attendance:checkout", refresh);
        };
    }, [date]);

    // 📊 Analytics
    const total = records.length;
    const present = records.filter(
        (r) => r.status === "Present" || r.status === "Full-Day",
    ).length;
    const halfDay = records.filter((r) => r.status === "Half-Day").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const chartData = [
        { label: "Present", value: present, fill: "#22c55e" },
        { label: "Half-Day", value: halfDay, fill: "#eab308" },
        { label: "Absent", value: absent, fill: "#ef4444" },
    ];

    const updateShiftRule = (shift, field, value) => {
        setPolicy((prev) => ({
            ...prev,
            shiftRules: {
                ...prev.shiftRules,
                [shift]: {
                    ...prev.shiftRules[shift],
                    [field]: value,
                },
            },
        }));
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Attendance Reports
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage policies and view daily attendance stats</p>
                    </div>

                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Employees</p>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{total}</p>
                    </div>

                    <div className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-green-700 uppercase tracking-wider">Present</p>
                        <p className="text-3xl font-bold text-green-700 mt-2">{present}</p>
                    </div>

                    <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-100 flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-red-700 uppercase tracking-wider">Absent</p>
                        <p className="text-3xl font-bold text-red-700 mt-2">{absent}</p>
                    </div>
                </div>

                {/* Attendance Policy Section */}
                {policy && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Attendance Configuration</h2>
                                <p className="text-xs text-slate-500">Configure shifts, timings, and penalty rules</p>
                            </div>
                            <button
                                onClick={async () => {
                                    try {
                                        await savePolicy.run(policy);
                                        toastSuccess("Attendance rules updated");
                                    } catch (error) {
                                        toastError(error?.response?.data?.message || "Failed to update rules");
                                    }
                                }}
                                disabled={savePolicy.loading}
                                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savePolicy.loading ? "Saving Changes..." : "Save Policy"}
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            
                            {/* Shift Type Selection */}
                            <div className="col-span-1 lg:col-span-2 xl:col-span-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Global Shift Type</label>
                                <select
                                    value={policy.shiftType || "Fixed"}
                                    onChange={(e) => setPolicy((prev) => ({ ...prev, shiftType: e.target.value }))}
                                    className="w-full md:w-1/3 bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                                >
                                    <option value="Fixed">Fixed Shift</option>
                                    <option value="Flexible">Flexible Shift</option>
                                </select>
                            </div>

                            {/* Specific Shift Rules */}
                            {["Morning", "Evening", "Night"].map((shift) => (
                                <div key={shift} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800">{shift} Shift</h3>
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">Fixed</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={policy.shiftRules?.[shift]?.start || ""}
                                                    onChange={(e) => updateShiftRule(shift, "start", e.target.value)}
                                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    value={policy.shiftRules?.[shift]?.end || ""}
                                                    onChange={(e) => updateShiftRule(shift, "end", e.target.value)}
                                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Break (mins)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={policy.shiftRules?.[shift]?.breakMinutes ?? 60}
                                                    onChange={(e) => updateShiftRule(shift, "breakMinutes", Number(e.target.value))}
                                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Grace (mins)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={policy.shiftRules?.[shift]?.graceMinutes ?? 10}
                                                    onChange={(e) => updateShiftRule(shift, "graceMinutes", Number(e.target.value))}
                                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                            <input
                                                id={`${shift}-breakPaid`}
                                                type="checkbox"
                                                checked={policy.shiftRules?.[shift]?.breakPaid ?? false}
                                                onChange={(e) => updateShiftRule(shift, "breakPaid", e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`${shift}-breakPaid`} className="text-sm text-slate-600 font-medium">
                                                Paid Break
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Flexible Shift Settings */}
                            <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800">Flexible Shift</h3>
                                    <span className="text-xs font-mono bg-indigo-50 px-2 py-1 rounded text-indigo-600">Config</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Required Hours/Day</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={policy.flexibleShift?.requiredHours ?? 9}
                                            onChange={(e) => setPolicy((prev) => ({
                                                ...prev, flexibleShift: { ...prev.flexibleShift, requiredHours: Number(e.target.value) }
                                            }))}
                                            className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Grace Period (mins)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={policy.flexibleShift?.graceMinutes ?? 15}
                                            onChange={(e) => setPolicy((prev) => ({
                                                ...prev, flexibleShift: { ...prev.flexibleShift, graceMinutes: Number(e.target.value) }
                                            }))}
                                            className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Day & Absent Rules */}
                            <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                <h3 className="font-bold text-slate-800 mb-4">Day & Absent Rules</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Min Half-Day (hrs)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={policy.minHalfDayHours ?? 4}
                                                onChange={(e) => setPolicy((prev) => ({ ...prev, minHalfDayHours: Number(e.target.value) }))}
                                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Min Full-Day (hrs)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={policy.minFullDayHours ?? 8}
                                                onChange={(e) => setPolicy((prev) => ({ ...prev, minFullDayHours: Number(e.target.value) }))}
                                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Auto Mark Absent Time</label>
                                        <input
                                            type="time"
                                            value={policy.absentAutoMarkTime || "12:00"}
                                            onChange={(e) => setPolicy((prev) => ({ ...prev, absentAutoMarkTime: e.target.value }))}
                                            className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Consecutive Absent Alert (Days)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={policy.consecutiveAbsentThreshold ?? 3}
                                            onChange={(e) => setPolicy((prev) => ({ ...prev, consecutiveAbsentThreshold: Number(e.target.value) }))}
                                            className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Late / Early Rules */}
                            <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                <h3 className="font-bold text-slate-800 mb-4">Late & Early Out</h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-3 rounded-md">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-slate-700">Late Rule</label>
                                            <input
                                                type="checkbox"
                                                checked={policy.lateRule?.enabled ?? true}
                                                onChange={(e) => setPolicy((prev) => ({ ...prev, lateRule: { ...prev.lateRule, enabled: e.target.checked } }))}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                        {policy.lateRule?.enabled && (
                                             <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Late Instances to Half-Day</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={policy.lateRule?.lateToHalfDayCount ?? 3}
                                                    onChange={(e) => setPolicy((prev) => ({ ...prev, lateRule: { ...prev.lateRule, lateToHalfDayCount: Number(e.target.value) } }))}
                                                    className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-md">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-slate-700">Early Out</label>
                                            <input
                                                type="checkbox"
                                                checked={policy.earlyOutRule?.enabled ?? true}
                                                onChange={(e) => setPolicy((prev) => ({ ...prev, earlyOutRule: { ...prev.earlyOutRule, enabled: e.target.checked } }))}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                        {policy.earlyOutRule?.enabled && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="earlyDeduct"
                                                    type="checkbox"
                                                    checked={policy.earlyOutRule?.deductByMinutes ?? true}
                                                    onChange={(e) => setPolicy((prev) => ({ ...prev, earlyOutRule: { ...prev.earlyOutRule, deductByMinutes: e.target.checked } }))}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor="earlyDeduct" className="text-xs text-slate-600">Deduct strictly by minutes</label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Overtime */}
                            <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                                <h3 className="font-bold text-slate-800 mb-4">Overtime Configuration</h3>
                                <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700">Enable Overtime</span>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input 
                                            type="checkbox" 
                                            name="toggle" 
                                            id="otEnabled" 
                                            checked={policy.overtime?.enabled ?? true}
                                            onChange={(e) => setPolicy((prev) => ({ ...prev, overtime: { ...prev.overtime, enabled: e.target.checked } }))}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                {policy.overtime?.enabled && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Start OT After (mins)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={policy.overtime?.startAfterMinutes ?? 30}
                                                onChange={(e) => setPolicy((prev) => ({ ...prev, overtime: { ...prev.overtime, startAfterMinutes: Number(e.target.value) } }))}
                                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Pay Rate Multiplier (x)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="0.1"
                                                value={policy.overtime?.rateMultiplier ?? 1.5}
                                                onChange={(e) => setPolicy((prev) => ({ ...prev, overtime: { ...prev.overtime, rateMultiplier: Number(e.target.value) } }))}
                                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts & Table Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-800 mb-6">Attendance Overview</h2>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col lg:col-span-2 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                             <h2 className="font-bold text-slate-800">Daily Logs</h2>
                        </div>
                        
                        <div className="overflow-x-auto flex-1">
                            {attendanceLoader.loading && <div className="p-4"><TableSkeleton rows={6} /></div>}

                            {!attendanceLoader.loading && records.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <p>No attendance records for this date</p>
                                </div>
                            )}

                            {!attendanceLoader.loading && records.length > 0 && (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Check In</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Check Out</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {records.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {rec.employee?.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {rec.checkIn
                                                        ? new Date(rec.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                        : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {rec.checkOut
                                                        ? new Date(rec.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                        : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${rec.status === "Full-Day" || rec.status === "Present" ? "bg-green-100 text-green-800" : 
                                                          rec.status === "Half-Day" ? "bg-yellow-100 text-yellow-800" : 
                                                          "bg-red-100 text-red-800"}`}>
                                                        {rec.status}
                                                    </span>
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
        </MainLayout>
    );
};

export default AttendanceReports;
