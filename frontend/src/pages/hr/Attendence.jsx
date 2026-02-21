import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import {
    markAttendance,
    getMyAttendance,
    getAttendanceByEmployee,
} from "../../services/attendanceService";
import { getAllEmployees } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";

const formatMonth = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
};

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const Attendance = () => {
    const [activeTab, setActiveTab] = useState("my");
    const [monthDate, setMonthDate] = useState(new Date());
    const [myRecords, setMyRecords] = useState([]);
    const [employeeRecords, setEmployeeRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("calendar");

    const fetchEmployees = async () => {
        try {
            const data = await getAllEmployees();
            setEmployees(data || []);
            if (!selectedEmployeeId && data?.length) {
                setSelectedEmployeeId(data[0]._id);
            }
        } catch {
            toastError("Failed to load employees");
        }
    };

    const fetchMyAttendance = async () => {
        try {
            setLoading(true);
            const records = await getMyAttendance({
                month: formatMonth(monthDate),
            });
            const sorted = Array.isArray(records)
                ? [...records].sort(
                      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
                  )
                : [];
            setMyRecords(sorted);
        } catch {
            toastError("Failed to load my attendance");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeAttendance = async () => {
        if (!selectedEmployeeId) return;
        try {
            setLoading(true);
            const records = await getAttendanceByEmployee(selectedEmployeeId, {
                month: formatMonth(monthDate),
            });
            const sorted = Array.isArray(records)
                ? [...records].sort(
                      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
                  )
                : [];
            setEmployeeRecords(sorted);
        } catch {
            toastError("Failed to load employee attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (activeTab === "my") fetchMyAttendance();
        else fetchEmployeeAttendance();
    }, [activeTab, monthDate, selectedEmployeeId]);

    useEffect(() => {
        if (activeTab === "my") {
            setEmployeeRecords([]);
        }
    }, [activeTab]);

    const today = new Date();
    const todayRecord = useMemo(() => {
        return myRecords.find((rec) => {
            if (!rec.date) return false;
            return isSameDay(new Date(rec.date), today);
        });
    }, [myRecords]);

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        if (activeTab === "my" && !isSameDay(date, today)) {
            toastError("Attendance can be marked only for today");
        }
    };

    const handleAttendance = async () => {
        if (!isSameDay(selectedDate, today)) {
            toastError("Attendance can be marked only for today");
            return;
        }

        try {
            setLoading(true);
            const res = await markAttendance();
            if (res?.message) {
                toastSuccess(res.message);
            }
            fetchMyAttendance();
        } catch (error) {
            toastError(
                error?.response?.data?.message || "Failed to mark attendance"
            );
        } finally {
            setLoading(false);
        }
    };

    const statusLabel = todayRecord?.checkOut
        ? "Checked Out"
        : todayRecord?.checkIn
        ? "Checked In"
        : "Not Checked In";

    const deriveStatus = (record) => {
        if (record?.checkIn && !record?.checkOut) return "Checked In";
        if (record?.status) return record.status;
        if (record?.checkIn && record?.checkOut) return "Present";
        return "Absent";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Checked In": return "bg-indigo-100 text-indigo-700";
            case "Present": return "bg-green-100 text-green-700";
            case "Half-Day": return "bg-yellow-100 text-yellow-700";
            case "Absent": return "bg-red-100 text-red-700";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
                
                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage daily check-ins and view monthly history.</p>
                    </div>
                    
                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200">
                        <button
                            onClick={() => setActiveTab("my")}
                            className={`px-5 py-2 text-sm font-medium rounded-md transition-all shadow-sm
                                ${activeTab === "my" ? "bg-white text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 shadow-none"}`}
                        >
                            My Attendance
                        </button>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-5 py-2 text-sm font-medium rounded-md transition-all shadow-sm
                                ${activeTab === "all" ? "bg-white text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 shadow-none"}`}
                        >
                            Employee View
                        </button>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    {/* Left: View & Date Nav */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setViewMode("calendar")}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                                    viewMode === "calendar" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                                Calendar
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-colors ${
                                    viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                                List
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
                                className="px-3 py-2 hover:bg-slate-50 border-r border-slate-200 text-slate-600 transition-colors"
                            >
                                ←
                            </button>
                            <span className="px-4 py-2 text-sm font-semibold text-slate-700 min-w-[140px] text-center">
                                {monthDate.toLocaleString("default", { month: "long" })} {monthDate.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
                                className="px-3 py-2 hover:bg-slate-50 border-l border-slate-200 text-slate-600 transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {/* Right: Employee Selector */}
                    {activeTab === "all" && (
                        <div className="w-full md:w-64">
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.name} ({emp.employeeId})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Calendar/List Container */}
                    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${activeTab === "my" ? "lg:col-span-2" : "lg:col-span-3"}`}>
                        {viewMode === "calendar" ? (
                            <div className="p-6">
                                <AttendanceCalendar
                                    monthDate={monthDate}
                                    records={activeTab === "my" ? myRecords : employeeRecords}
                                    selectedDate={selectedDate}
                                    onSelectDate={handleSelectDate}
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {loading && (
                                    <p className="p-8 text-center text-slate-500 animate-pulse">Loading attendance records...</p>
                                )}
                                {!loading && (activeTab === "my" ? myRecords : employeeRecords).length === 0 ? (
                                    <p className="p-12 text-center text-slate-500 italic">No attendance records found for this period.</p>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Check In</th>
                                                <th className="px-6 py-4">Check Out</th>
                                                <th className="px-6 py-4">Worked (min)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(activeTab === "my" ? myRecords : employeeRecords).map((rec) => (
                                                <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-700">
                                                        {rec.date ? new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : "-"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(deriveStatus(rec))}`}>
                                                            {deriveStatus(rec)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-slate-500">
                                                        {rec.workedMinutes || 0}m
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                        {activeTab === "my" && (
                            <div className="bg-slate-50 p-3 text-xs text-center text-slate-400 border-t border-slate-100">
                                Viewing your personal attendance history.
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Action Card (Only for My Attendance) */}
                    {activeTab === "my" && (
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-slate-800">Today's Action</h2>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mb-6 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
                                    <p className={`text-xl font-bold ${
                                        todayRecord?.checkOut ? "text-slate-500" : 
                                        todayRecord?.checkIn ? "text-green-600" : "text-slate-800"
                                    }`}>
                                        {statusLabel}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-white p-3 rounded border border-slate-200">
                                            <p className="text-xs text-slate-400">In Time</p>
                                            <p className="font-mono font-medium text-slate-700">
                                                {todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-slate-200">
                                            <p className="text-xs text-slate-400">Out Time</p>
                                            <p className="font-mono font-medium text-slate-700">
                                                {todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAttendance}
                                        disabled={loading || (todayRecord?.checkIn && todayRecord?.checkOut)}
                                        className={`w-full py-3.5 rounded-lg font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2
                                            ${todayRecord?.checkOut 
                                                ? "bg-slate-400 cursor-not-allowed opacity-70" 
                                                : todayRecord?.checkIn 
                                                    ? "bg-amber-500 hover:bg-amber-600" 
                                                    : "bg-indigo-600 hover:bg-indigo-700"
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">Processing...</span>
                                        ) : !todayRecord?.checkIn ? (
                                            "Check In Now"
                                        ) : todayRecord?.checkOut ? (
                                            "Day Completed"
                                        ) : (
                                            "Check Out Now"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Attendance;
