import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/interceptors";
import { getNotifications } from "../../services/notificationService";
import { getSocket } from "../../services/socket";
import useAsync from "../../hooks/useAsync";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const statsLoader = useAsync(async () => {
        const res = await api.get("/admin/dashboard");
        setStats(res.data.data);
    });

    const notificationsLoader = useAsync(async () => {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
    });

    useEffect(() => {
        statsLoader.run().catch(() => {});
        notificationsLoader.run().catch(() => {});
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const refresh = () => {
            statsLoader.run().catch(() => {});
            notificationsLoader.run().catch(() => {});
        };

        socket.on("project:assigned", refresh);
        socket.on("project:unassigned", refresh);
        socket.on("attendance:checkin", refresh);
        socket.on("attendance:checkout", refresh);

        return () => {
            socket.off("project:assigned", refresh);
            socket.off("project:unassigned", refresh);
            socket.off("attendance:checkin", refresh);
            socket.off("attendance:checkout", refresh);
        };
    }, []);

    const chartData = stats
        ? [
              { label: "Total", value: stats.totalUsers || 0 },
              { label: "Active", value: stats.activeUsers || 0 },
              { label: "Locked", value: stats.lockedUsers || 0 },
              { label: "Failed", value: stats.failedLogins || 0 },
          ]
        : [];

    return (
        <MainLayout>
            <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Admin Dashboard</h1>

                {statsLoader.loading && (
                    <p className="text-slate-500 animate-pulse">
                        Loading system statistics...
                    </p>
                )}

                {stats && (
                    <div className="space-y-6">
                        {/* Stats Grid: 2 columns on mobile, 4 on desktop */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatCard label="Total Users" value={stats.totalUsers} />
                            <StatCard label="Active Users" value={stats.activeUsers} />
                            <StatCard label="Locked Users" value={stats.lockedUsers} />
                            <StatCard label="Failed Logins" value={stats.failedLogins} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Charts Section */}
                            <div className="bg-white rounded-xl shadow p-4 md:p-6 lg:col-span-2">
                                <h2 className="font-semibold mb-4 text-lg">
                                    System Overview
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="h-64 md:h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" fontSize={12} />
                                                <YAxis fontSize={12} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="h-64 md:h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" fontSize={12} />
                                                <YAxis fontSize={12} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications Section */}
                            <div className="bg-white rounded-xl shadow p-4 md:p-6">
                                <h2 className="font-semibold mb-4 text-lg">
                                    Latest Notifications
                                </h2>
                                {notifications.length === 0 && (
                                    <p className="text-sm text-slate-500">
                                        No notifications
                                    </p>
                                )}
                                {notifications.length > 0 && (
                                    <ul className="space-y-3 text-sm">
                                        {notifications.slice(0, 5).map((note) => (
                                            <li
                                                key={note._id}
                                                className="border rounded-lg p-3 hover:bg-slate-50 transition-colors"
                                            >
                                                <p className="font-medium text-slate-800 break-words">
                                                    {note.title}
                                                </p>
                                                <p className="text-slate-600 mt-1 break-words text-xs md:text-sm">
                                                    {note.message}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

const StatCard = ({ label, value }) => (
    <div className="bg-white rounded-xl shadow p-3 md:p-4 flex flex-col justify-center">
        <p className="text-xs md:text-sm text-slate-500 font-medium truncate">{label}</p>
        <p className="text-xl md:text-2xl font-bold mt-1 text-slate-800">{value}</p>
    </div>
);

export default AdminDashboard;
