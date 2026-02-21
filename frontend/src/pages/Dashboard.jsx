import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { useAuthStore } from "../store/authStore";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    CartesianGrid 
} from "recharts";

// Dummy data for visualization
const companyStats = [
    { name: "Jan", attendance: 92 },
    { name: "Feb", attendance: 95 },
    { name: "Mar", attendance: 88 },
    { name: "Apr", attendance: 96 },
    { name: "May", attendance: 94 },
    { name: "Jun", attendance: 98 },
];

const announcements = [
    {
        id: 1,
        title: "Q1 Town Hall Meeting",
        date: "Tomorrow, 10:00 AM",
        type: "Event",
        color: "bg-blue-100 text-blue-700"
    },
    {
        id: 2,
        title: "New Health Insurance Policy",
        date: "Feb 15, 2026",
        type: "Policy",
        color: "bg-green-100 text-green-700"
    },
    {
        id: 3,
        title: "System Maintenance",
        date: "Feb 20, 2026",
        type: "Alert",
        color: "bg-amber-100 text-amber-700"
    }
];

const Dashboard = () => {
    const { user } = useAuthStore();
    const [greeting, setGreeting] = useState("Good Morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const rolePath = user?.role === "Admin" ? "/admin" : user?.role === "HR" ? "/hr" : "/employee";

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto pb-10 space-y-8">
                
                {/* --- Welcome Hero Section --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl p-8 md:p-12 text-white"
                >
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {greeting}, {user?.name?.split(" ")[0]}!
                        </h1>
                        <p className="text-slate-300 max-w-xl text-lg">
                            Welcome to your HRMS dashboard. You have <span className="font-bold text-white">3 new notifications</span> and <span className="font-bold text-white">1 pending task</span> for today.
                        </p>
                        
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link to={`${rolePath}/profile`}>
                                <button className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-sm">
                                    View Profile
                                </button>
                            </Link>
                            <Link to={`${rolePath}/projects`}>
                                <button className="px-6 py-3 bg-slate-700/50 text-white font-semibold rounded-lg border border-white/10 hover:bg-slate-700 transition-colors backdrop-blur-sm">
                                    My Projects
                                </button>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Quick Actions Grid --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <QuickActionCard 
                                to={`${rolePath}/attendance`} 
                                title="Attendance" 
                                icon={<ClockIcon />} 
                                color="text-indigo-600" 
                                bg="bg-indigo-50" 
                            />
                            <QuickActionCard 
                                to={`${rolePath}/leaves`} 
                                title="Apply Leave" 
                                icon={<CalendarIcon />} 
                                color="text-emerald-600" 
                                bg="bg-emerald-50" 
                            />
                            <QuickActionCard 
                                to={`${rolePath}/salary`} 
                                title="Payslips" 
                                icon={<DocumentIcon />} 
                                color="text-amber-600" 
                                bg="bg-amber-50" 
                            />
                            {/* Add more shortcuts as needed */}
                        </div>

                        {/* --- Company Overview Chart --- */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Company Attendance Trends</h2>
                                <select className="text-xs border-slate-300 rounded-lg text-slate-600 bg-slate-50 px-2 py-1 outline-none">
                                    <option>Last 6 Months</option>
                                    <option>This Year</option>
                                </select>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={companyStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* --- Sidebar: Announcements & Status --- */}
                    <div className="space-y-6">
                        
                        {/* Announcements Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h2 className="font-bold text-slate-800">Announcements</h2>
                                <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">View All</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {announcements.map((item) => (
                                    <div key={item.id} className="p-5 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.color}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-slate-400">{item.date}</span>
                                        </div>
                                        <h3 className="font-medium text-slate-800 text-sm mt-2 leading-snug">{item.title}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Quote / Widget */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white text-center">
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-3">Quote of the Day</p>
                            <p className="font-medium text-lg italic">
                                "The only way to do great work is to love what you do."
                            </p>
                            <p className="text-sm mt-2 opacity-80">— Steve Jobs</p>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// --- Helper Components (Icons) ---

const QuickActionCard = ({ to, title, icon, color, bg }) => (
    <Link to={to} className="group">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all h-full flex flex-col items-center justify-center text-center gap-3 group-hover:border-indigo-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="font-semibold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{title}</span>
        </div>
    </Link>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

export default Dashboard;