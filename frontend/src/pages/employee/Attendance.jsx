import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import { markAttendance, getMyAttendance } from "../../services/attendanceService";
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

const EmployeeAttendance = () => {
    const [monthDate, setMonthDate] = useState(new Date());
    const [records, setRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("calendar");

    const fetchMonth = async () => {
        try {
            setLoading(true);
            const records = await getMyAttendance({ month: formatMonth(monthDate) });
            const sorted = Array.isArray(records)
                ? [...records].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                : [];
            setRecords(sorted);
        } catch {
            toastError("Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonth();
    }, [monthDate]);

    const today = new Date();
    const todayRecord = useMemo(() => {
        return records.find((rec) => {
            if (!rec.date) return false;
            return isSameDay(new Date(rec.date), today);
        });
    }, [records]);

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        if (!isSameDay(date, today)) {
            // Optional: Show toast or just select
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
            if (res?.message) toastSuccess(res.message);
            fetchMonth();
        } catch (error) {
            toastError(error?.response?.data?.message || "Failed to mark attendance");
        } finally {
            setLoading(false);
        }
    };

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
            <div className="max-w-6xl mx-auto pb-10 space-y-6">
                
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Attendance Tracker</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your daily check-ins and history.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode("calendar")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    viewMode === "calendar" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Calendar
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                List View
                            </button>
                        </div>

                        <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                            <button onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))} className="px-3 py-2 hover:bg-slate-50 border-r border-slate-200 text-slate-600">←</button>
                            <span className="px-4 py-2 text-sm font-semibold text-slate-700 min-w-[140px] text-center">
                                {monthDate.toLocaleString("default", { month: "long" })} {monthDate.getFullYear()}
                            </span>
                            <button onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))} className="px-3 py-2 hover:bg-slate-50 border-l border-slate-200 text-slate-600">→</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {viewMode === "calendar" ? (
                                <div className="p-6">
                                    <AttendanceCalendar
                                        monthDate={monthDate}
                                        records={records}
                                        selectedDate={selectedDate}
                                        onSelectDate={handleSelectDate}
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    {loading && <p className="p-8 text-center text-slate-500 animate-pulse">Loading attendance...</p>}
                                    {!loading && records.length === 0 && <p className="p-8 text-center text-slate-500">No attendance records for this month.</p>}
                                    {!loading && records.length > 0 && (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">In / Out</th>
                                                    <th className="px-6 py-4">Hours</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {records.map((rec) => (
                                                    <tr key={rec._id} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-medium text-slate-700">
                                                            {rec.date ? new Date(rec.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', weekday: 'short' }) : "-"}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(deriveStatus(rec))}`}>
                                                                {deriveStatus(rec)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-500">
                                                            <div>In: {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</div>
                                                            <div>Out: {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-slate-600">
                                                            {rec.workedMinutes ? (rec.workedMinutes / 60).toFixed(1) + "h" : "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Today's Action */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="font-bold text-slate-800 mb-1">Today's Action</h2>
                            <p className="text-sm text-slate-500 mb-6">{new Date().toDateString()}</p>

                            <div className="flex flex-col gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {todayRecord?.checkOut ? "Checked Out" : todayRecord?.checkIn ? "Checked In" : "Not Checked In"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase">In Time</p>
                                        <p className="font-mono text-sm text-slate-700 mt-1">
                                            {todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase">Out Time</p>
                                        <p className="font-mono text-sm text-slate-700 mt-1">
                                            {todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAttendance}
                                    disabled={loading || (todayRecord?.checkIn && todayRecord?.checkOut)}
                                    className={`w-full py-3 rounded-lg font-bold text-white shadow-sm transition-all
                                        ${todayRecord?.checkOut 
                                            ? "bg-slate-400 cursor-not-allowed" 
                                            : todayRecord?.checkIn 
                                                ? "bg-amber-500 hover:bg-amber-600" 
                                                : "bg-indigo-600 hover:bg-indigo-700"}`}
                                >
                                    {loading ? "Processing..." : 
                                     todayRecord?.checkOut ? "Day Completed" :
                                     todayRecord?.checkIn ? "Check Out Now" : "Check In Now"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EmployeeAttendance;
