import MainLayout from "../../layouts/MainLayout";
import StatCard from "../../components/charts/StatCard";
import AttendanceChart from "../../components/charts/AttendanceChart";
import PayrollChart from "../../components/charts/PayrollChart";
import ProjectComparisonChart from "../../components/charts/ProjectComparisonChart";
import LeaveComparisonChart from "../../components/charts/LeaveComparisonChart";
import {
    getDashboardStats,
    getDashboardCharts,
    getProjectTrends,
    getLeaveTrends,
} from "../../services/dashboardService";
import { attendanceData as dummyAttendance, payrollData as dummyPayroll } from "../../utils/dummyAnalytics";
import { useState, useEffect } from "react";

const HRDashboard = () => {
    const [stats, setStats] = useState({
        pendingLeaves: 0,
        upcomingProjects: 0,
        pendingPayrolls: 0,
        activeEmployees: 0
    });
    const [chartData, setChartData] = useState({
        attendance: dummyAttendance,
        payroll: dummyPayroll
    });
    const [loading, setLoading] = useState(true);
    const [projectSeries, setProjectSeries] = useState([]);
    const [leaveOverall, setLeaveOverall] = useState([]);

    const today = new Date();
    const monthOptions = Array.from({ length: 6 }).map((_, idx) => {
        const d = new Date(today.getFullYear(), today.getMonth() - idx, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("default", { month: "short", year: "numeric" });
        return { value, label };
    });

    const [selectedProjectMonths, setSelectedProjectMonths] = useState([
        monthOptions[0]?.value,
    ]);
    const [selectedLeaveMonths, setSelectedLeaveMonths] = useState([
        monthOptions[0]?.value,
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartsRes] = await Promise.all([
                    getDashboardStats(),
                    getDashboardCharts()
                ]);
                setStats(statsRes.data);
                
                if (chartsRes.data) {
                    setChartData({
                        attendance: chartsRes.data.attendance.length ? chartsRes.data.attendance : dummyAttendance,
                        payroll: chartsRes.data.payroll.length ? chartsRes.data.payroll : dummyPayroll
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchProjectTrends = async () => {
            try {
                const res = await getProjectTrends(selectedProjectMonths);
                setProjectSeries(res?.data?.series || []);
            } catch {
                setProjectSeries([]);
            }
        };
        fetchProjectTrends();
    }, [selectedProjectMonths]);

    useEffect(() => {
        const fetchLeaveTrends = async () => {
            try {
                const res = await getLeaveTrends(selectedLeaveMonths);
                setLeaveOverall(res?.data?.overall || []);
            } catch {
                setLeaveOverall([]);
            }
        };
        fetchLeaveTrends();
    }, [selectedLeaveMonths]);

    const handleMonthToggle = (value, currentSelection, setSelection) => {
        if (currentSelection.includes(value)) {
            if (currentSelection.length > 1) {
                setSelection(currentSelection.filter(m => m !== value));
            }
        } else {
            setSelection([...currentSelection, value]);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">HR Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Overview of company metrics, projects, and employee activities.</p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Employees"
                        value={loading ? "..." : stats.activeEmployees}
                        subtitle="Total active staff"
                        icon="Users"
                    />
                    <StatCard
                        title="Pending Leaves"
                        value={loading ? "..." : stats.pendingLeaves}
                        subtitle="Requires approval"
                        icon="Calendar"
                        color="text-yellow-600"
                        bgColor="bg-yellow-100"
                    />
                    <StatCard
                        title="Upcoming Projects"
                        value={loading ? "..." : stats.upcomingProjects}
                        subtitle="Starting soon"
                        icon="Briefcase"
                        color="text-blue-600"
                        bgColor="bg-blue-100"
                    />
                    <StatCard
                        title="Pending Payrolls"
                        value={loading ? "..." : stats.pendingPayrolls}
                        subtitle="Open payments"
                        icon="DollarSign"
                        color="text-red-600"
                        bgColor="bg-red-100"
                    />
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 mb-4">Attendance Overview</h2>
                        <AttendanceChart data={chartData.attendance} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="font-bold text-slate-800 mb-4">Payroll Expenses</h2>
                        <PayrollChart data={chartData.payroll} />
                    </div>
                </div>

                {/* Comparison Analysis */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Project Trends */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="font-bold text-slate-800">Project Trends</h2>
                                <p className="text-sm text-slate-500">Creation volume across months</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {monthOptions.map((opt) => {
                                    const isSelected = selectedProjectMonths.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleMonthToggle(opt.value, selectedProjectMonths, setSelectedProjectMonths)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border
                                                ${isSelected 
                                                    ? "bg-indigo-600 text-white border-indigo-600" 
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ProjectComparisonChart series={projectSeries} />
                        </div>
                    </div>

                    {/* Leave Trends */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="font-bold text-slate-800">Leave Analysis</h2>
                                <p className="text-sm text-slate-500">Organization-wide leave patterns</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {monthOptions.map((opt) => {
                                    const isSelected = selectedLeaveMonths.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleMonthToggle(opt.value, selectedLeaveMonths, setSelectedLeaveMonths)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border
                                                ${isSelected 
                                                    ? "bg-indigo-600 text-white border-indigo-600" 
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <LeaveComparisonChart
                                data={leaveOverall}
                                title="Total Leaves"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default HRDashboard;