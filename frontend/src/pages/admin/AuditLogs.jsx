import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
    getAuditLogs,
    getAuditSummary,
    getAuditAlertRule,
    updateAuditAlertRule,
} from "../../services/auditLogService";
import { getSocket } from "../../services/socket";
import useAsync from "../../hooks/useAsync";
import useFilters from "../../hooks/useFilters";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    LineChart,
    Line,
} from "recharts";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { filters, setFilter, setFilters } = useFilters({
        status: "",
        role: "",
        entity: "",
        action: "",
        fromDate: "",
        toDate: "",
    });
    const [summary, setSummary] = useState(null);
    const [alertRule, setAlertRule] = useState(null);

    const logsLoader = useAsync(async (nextPage = page) => {
        const res = await getAuditLogs({
            page: nextPage,
            limit: 10,
            ...filters,
        });
        setLogs(res.data.logs || []);
        setTotalPages(res.data.totalPages || 1);
    });

    const summaryLoader = useAsync(async () => {
        const res = await getAuditSummary({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
        });
        setSummary(res.data);
    });

    const alertRuleLoader = useAsync(async () => {
        const res = await getAuditAlertRule();
        setAlertRule(res.data);
    });

    const saveRule = useAsync(async (rule) => {
        await updateAuditAlertRule(rule);
    });

    useEffect(() => {
        logsLoader.run(page).catch(() => {});
        summaryLoader.run().catch(() => setSummary(null));
        alertRuleLoader.run().catch(() => setAlertRule(null));
    }, [page, filters]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onLog = (log) => {
            setLogs((prev) => [log, ...prev.slice(0, 9)]);
        };
        const onAlert = (payload) => {
            alert(payload?.message || "Audit alert triggered");
        };

        socket.on("audit:log", onLog);
        socket.on("audit:alert", onAlert);

        return () => {
            socket.off("audit:log", onLog);
            socket.off("audit:alert", onAlert);
        };
    }, []);

    const statusData = useMemo(() => {
        if (!summary?.byStatus) return [];
        return summary.byStatus.map((item) => ({
            name: item._id || "Unknown",
            value: item.count,
        }));
    }, [summary]);

    const actionData = useMemo(() => {
        if (!summary?.byAction) return [];
        return summary.byAction.map((item) => ({
            name: item._id || "Unknown",
            value: item.count,
        }));
    }, [summary]);

    const entityData = useMemo(() => {
        if (!summary?.byEntity) return [];
        return summary.byEntity.map((item) => ({
            name: item._id || "Unknown",
            value: item.count,
        }));
    }, [summary]);

    const roleData = useMemo(() => {
        if (!summary?.byRole) return [];
        return summary.byRole.map((item) => ({
            name: item._id || "Unknown",
            value: item.count,
        }));
    }, [summary]);

    const weeklyData = useMemo(() => {
        if (!summary?.weekly) return [];
        return summary.weekly.map((item) => ({
            date: item._id,
            value: item.count,
        }));
    }, [summary]);

    const topUsers = summary?.topUsers || [];

    const pieColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

    const exportCsv = () => {
        if (!logs.length) return;
        const headers = ["User", "Email", "Role", "Action", "Entity", "Status", "IP", "Time"];
        const rows = logs.map((log) => [
            log.userName || log.userId?.name || "",
            log.userEmail || log.email || "",
            log.role || "",
            log.action || "",
            log.entity || "",
            log.status || "",
            log.ipAddress || "",
            new Date(log.createdAt).toLocaleString(),
        ]);
        const csv = [headers, ...rows]
            .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "audit-logs.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPdf = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;
        const rows = logs
            .map(
                (log) => `
                <tr>
                    <td>${log.userName || log.userId?.name || ""}</td>
                    <td>${log.userEmail || log.email || ""}</td>
                    <td>${log.role || ""}</td>
                    <td>${log.action || ""}</td>
                    <td>${log.entity || ""}</td>
                    <td>${log.status || ""}</td>
                    <td>${log.ipAddress || ""}</td>
                    <td>${new Date(log.createdAt).toLocaleString()}</td>
                </tr>`
            )
            .join("");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Audit Logs</title>
                    <style>
                        body { font-family: sans-serif; }
                        table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>Audit Logs Report</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Status</th>
                                <th>IP</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto space-y-6 pb-8">
                
                {/* Header & Exports */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">System Audit Logs</h1>
                        <p className="text-sm text-slate-500 mt-1">Track system activities, security events, and user actions.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={exportCsv} 
                            disabled={!logs.length}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
                        >
                            Export CSV
                        </button>
                        <button 
                            onClick={exportPdf} 
                            disabled={!logs.length}
                            className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors text-sm disabled:opacity-50"
                        >
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Search Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) => { setFilter("status", e.target.value); setPage(1); }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <select
                            value={filters.role}
                            onChange={(e) => { setFilter("role", e.target.value); setPage(1); }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="HR">HR</option>
                            <option value="Employee">Employee</option>
                        </select>
                        <input
                            type="text"
                            value={filters.entity}
                            onChange={(e) => { setFilter("entity", e.target.value); setPage(1); }}
                            placeholder="Search Entity..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                            type="text"
                            value={filters.action}
                            onChange={(e) => { setFilter("action", e.target.value); setPage(1); }}
                            placeholder="Search Action..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => { setFilter("fromDate", e.target.value); setPage(1); }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                        />
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => { setFilter("toDate", e.target.value); setPage(1); }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                        />
                    </div>
                </div>

                {/* Alert Rules Configuration */}
                {alertRule && (
                    <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-bold text-slate-800">Security Alert Configuration</h2>
                                <p className="text-xs text-slate-500 mt-1">Configure thresholds for suspicious activity alerts.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 px-2">
                                    <input
                                        id="alertEnabled"
                                        type="checkbox"
                                        checked={alertRule.enabled ?? true}
                                        onChange={(e) => setAlertRule((prev) => ({ ...prev, enabled: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="alertEnabled" className="text-sm font-medium text-slate-700 cursor-pointer">Monitor Failed Logins</label>
                                </div>
                                
                                <div className="flex flex-col">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Threshold</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={alertRule.failedLoginThreshold ?? 5}
                                        onChange={(e) => setAlertRule((prev) => ({ ...prev, failedLoginThreshold: Number(e.target.value) }))}
                                        className="w-24 border-b border-slate-300 bg-transparent py-1 text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                                
                                <div className="flex flex-col">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Window (mins)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={alertRule.windowMinutes ?? 60}
                                        onChange={(e) => setAlertRule((prev) => ({ ...prev, windowMinutes: Number(e.target.value) }))}
                                        className="w-24 border-b border-slate-300 bg-transparent py-1 text-sm focus:border-blue-500 outline-none"
                                    />
                                </div>
                                
                                <button
                                    onClick={async () => {
                                        try {
                                            await saveRule.run(alertRule);
                                            alert("Alert rule saved");
                                        } catch {
                                            // ignore
                                        }
                                    }}
                                    disabled={saveRule.loading}
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-md transition-colors disabled:opacity-50"
                                >
                                    {saveRule.loading ? "Saving..." : "Save Rule"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Dashboard */}
                {summary && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Weekly Activity - Spans 2 cols */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-2">
                            <h2 className="font-semibold text-slate-800 mb-4">Weekly Activity Volume</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Active Users */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-1">
                            <h2 className="font-semibold text-slate-800 mb-4">Top Active Users</h2>
                            <ul className="space-y-3">
                                {topUsers.map((u, idx) => (
                                    <li key={u._id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{u.name || "Unknown"}</p>
                                                <p className="text-xs text-slate-500 truncate">{u.role || "-"}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{u.count}</span>
                                    </li>
                                ))}
                                {topUsers.length === 0 && <li className="text-slate-500 text-sm italic">No data available</li>}
                            </ul>
                        </div>

                        {/* Status Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-1">
                            <h2 className="font-semibold text-slate-800 mb-2">Status Distribution</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={statusData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={60} 
                                            outerRadius={80} 
                                            paddingAngle={5}
                                        >
                                            {statusData.map((_, index) => (
                                                <Cell key={`status-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Action Bar Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-2">
                            <h2 className="font-semibold text-slate-800 mb-4">Action Types</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={actionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Entity Bar Chart */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-2">
                            <h2 className="font-semibold text-slate-800 mb-4">Entity Modifications</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={entityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Detailed Logs</h2>
                    </div>

                    <div className="overflow-x-auto">
                        {logsLoader.loading && (
                            <div className="p-8 text-center text-slate-500 animate-pulse">
                                Loading audit trail...
                            </div>
                        )}

                        {!logsLoader.loading && logs.length === 0 && (
                            <div className="p-12 text-center">
                                <p className="text-slate-500 mb-2">No audit logs found matching your criteria.</p>
                                <button onClick={() => {setFilters({ status: "", role: "", entity: "", action: "", fromDate: "", toDate: "" });}} className="text-blue-600 hover:underline text-sm font-medium">Clear Filters</button>
                            </div>
                        )}

                        {!logsLoader.loading && logs.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Entity</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">IP Address</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{log.userName || log.userId?.name || "Unknown"}</span>
                                                    <span className="text-xs text-slate-500">{log.userEmail || log.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">{log.action}</td>
                                            <td className="px-6 py-4 text-slate-600">{log.entity}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${log.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {log.status === "SUCCESS" ? "Success" : "Failed"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.ipAddress}</td>
                                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!logsLoader.loading && logs.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-600 font-medium">
                                Page <span className="text-slate-900">{page}</span> of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default AuditLogs;
