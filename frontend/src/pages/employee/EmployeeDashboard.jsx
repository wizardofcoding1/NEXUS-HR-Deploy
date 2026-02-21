import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getMyDashboardProjects } from "../../services/projectService";
import { getMyAttendance } from "../../services/attendanceService";
import { getMyBankDetails } from "../../services/bankDetailsService";
import { useAuthStore } from "../../store/authStore";
import { toastError } from "../../utils/toast";
import { 
    Bar, 
    BarChart, 
    CartesianGrid, 
    ResponsiveContainer, 
    Scatter, 
    ScatterChart, 
    Tooltip, 
    XAxis, 
    YAxis, 
    Cell 
} from "recharts";

const EmployeeDashboard = () => {
    const { user } = useAuthStore();
    const [projects, setProjects] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [bankDetailsMissing, setBankDetailsMissing] = useState(false);

    const isTeamLeader = user.teamLeader || user.role === "TeamLeader";

    // --- Analytics Logic ---
    const projectCount = projects.length;
    const completedCount = projects.filter(p => p.status === "Completed").length;
    const ongoingCount = projects.filter(p => p.status === "Ongoing").length;
    const scheduledCount = projects.filter(p => p.status === "Scheduled").length;

    const teamSize = isTeamLeader
        ? new Set(projects.flatMap((p) => p.employees ? p.employees.map((e) => e._id) : [])).size
        : 0;

    const monthKey = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }, []);

    const attendanceSummary = useMemo(() => {
        const summary = { fullDay: 0, halfDay: 0, absent: 0, present: 0 };
        attendance.forEach((rec) => {
            if (rec.status === "Full-Day") summary.fullDay += 1;
            else if (rec.status === "Half-Day") summary.halfDay += 1;
            else if (rec.status === "Absent") summary.absent += 1;
            else if (rec.status === "Present") summary.present += 1;
        });
        return summary;
    }, [attendance]);

    const statusData = useMemo(() => [
        { name: "Ongoing", value: ongoingCount, color: "#4f46e5" },   // Indigo
        { name: "Scheduled", value: scheduledCount, color: "#f59e0b" }, // Amber
        { name: "Completed", value: completedCount, color: "#10b981" }, // Emerald
    ], [ongoingCount, scheduledCount, completedCount]);

    const attendanceScatter = useMemo(() => {
        return attendance
            .filter((rec) => rec.date)
            .map((rec) => ({
                day: new Date(rec.date).getDate(),
                hours: rec.workedMinutes ? Math.round((rec.workedMinutes / 60) * 10) / 10 : 0,
            }))
            .sort((a, b) => a.day - b.day);
    }, [attendance]);

    const upcomingProject = useMemo(() => {
        const candidates = projects
            .filter((p) => p.status !== "Completed" && p.endDate)
            .map((p) => ({ ...p, endDateValue: new Date(p.endDate).getTime() }))
            .sort((a, b) => a.endDateValue - b.endDateValue);
        return candidates[0] || null;
    }, [projects]);

    // --- Data Fetching ---
    useEffect(() => {
        getMyDashboardProjects()
            .then(setProjects)
            .catch(() => toastError("Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        getMyAttendance({ month: monthKey })
            .then(setAttendance)
            .catch(() => {})
            .finally(() => setAttendanceLoading(false));
    }, [monthKey]);

    useEffect(() => {
        getMyBankDetails()
            .then((res) => {
                setBankDetailsMissing(!res);
            })
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setBankDetailsMissing(true);
                }
            });
    }, []);

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-8">
                
                {/* --- Welcome Hero Section --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 min-h-[200px] md:min-h-[280px]"
                >
                    {/* Background Decorative Blob */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                    <div className="relative z-10 max-w-lg mb-2 md:mb-0">
                        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                            Welcome<br/>back, {user.name.split(' ')[0]}!
                        </h1>
                        <p className="text-blue-100 text-sm md:text-lg leading-relaxed">
                            Here's your daily rundown. You have <strong className="text-white">{ongoingCount} active projects</strong> and your next deadline is {upcomingProject ? <span className="underline decoration-blue-300 decoration-2 underline-offset-2">{new Date(upcomingProject.endDate).toLocaleDateString()}</span> : "not set"}.
                        </p>
                    </div>

                    {/* Glassmorphism Navigation Bar (Hidden on Mobile) */}
                    <div className="hidden md:flex relative z-10 bg-white/20 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl gap-1 shadow-lg">
                        <Link to="/employee/attendance" className="px-6 py-3 rounded-xl bg-white text-indigo-700 text-sm font-bold shadow-sm text-center transition-transform hover:scale-105">
                            Attendance
                        </Link>
                        <Link to="/employee/projects" className="px-6 py-3 rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-colors text-center">
                            Projects
                        </Link>
                        <Link to="/employee/leaves" className="px-6 py-3 rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-colors text-center">
                            Leaves
                        </Link>
                    </div>
                </motion.div>

                {bankDetailsMissing && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="font-semibold">Bank details not submitted</p>
                            <p className="text-sm text-amber-700">Please add your bank details to receive salary payouts.</p>
                        </div>
                        <Link
                            to="/employee/bank-details"
                            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Add Bank Details
                        </Link>
                    </div>
                )}

                {/* --- Stats Grid --- */}
                {!loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.1 }} 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {/* Total Projects Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</p>
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-slate-800">{projectCount}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold">{completedCount} Done</span>
                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold">{ongoingCount} Active</span>
                            </div>
                        </div>
                        
                        {/* Attendance Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                             <div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-3xl font-black text-slate-800">{attendanceSummary.present + attendanceSummary.fullDay + attendanceSummary.halfDay}</p>
                                    <span className="text-sm text-slate-500 font-medium">/ 30 days</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${((attendanceSummary.present + attendanceSummary.fullDay) / 30) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Team Leader Stats (Conditional) */}
                        {isTeamLeader && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                                <div>
                                     <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Size</p>
                                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-black text-slate-800">{teamSize}</p>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-4">Leading across {projects.length} projects</p>
                            </div>
                        )}

                        {/* Role Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Role</p>
                                <p className="text-lg font-bold text-slate-800 mt-2 line-clamp-2" title={user.position}>{user.position || "Employee"}</p>
                            </div>
                            <div className="mt-4">
                                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-semibold">
                                    {user.department || "General Dept"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- Charts Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Project Status Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
                        <div className="mb-6">
                            <h2 className="font-bold text-slate-800 text-lg">Project Status</h2>
                            <p className="text-xs text-slate-500">Distribution of current work</p>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Work Hours Scatter Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="font-bold text-slate-800 text-lg">Work Hours Log</h2>
                            <p className="text-xs text-slate-500">Daily logged hours for the current month</p>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" type="number" name="Day" tickCount={15} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                                    <YAxis dataKey="hours" type="number" name="Hours" unit="h" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: "3 3" }} 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Scatter name="Attendance" data={attendanceScatter} fill="#4f46e5" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* --- Recent Projects Table --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-row justify-between items-center">
                        <h2 className="font-bold text-slate-800 text-lg">Active Projects</h2>
                        <Link to="/employee/projects" className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 hover:underline">
                            View All Projects &rarr;
                        </Link>
                    </div>
                    
                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                            {projects.slice(0, 3).map(proj => (
                                <div key={proj._id} className="group border border-slate-200 p-5 rounded-xl hover:shadow-md transition-all hover:border-indigo-100 bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                        </div>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide
                                            ${proj.status === 'Ongoing' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {proj.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 truncate text-lg mb-1">{proj.projectName}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-4">{proj.client}</p>
                                    
                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                                        <span>Deadline</span>
                                        <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                            {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "No Deadline"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                            </div>
                            <p className="text-slate-500 font-medium">No active projects at the moment.</p>
                            <p className="text-sm text-slate-400">Enjoy your free time!</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default EmployeeDashboard;
