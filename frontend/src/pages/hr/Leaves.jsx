import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getLeaves, approveLeave, rejectLeave } from "../../services/leaveService";
import { getSocket } from "../../services/socket";

const Leaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await getLeaves(status);
            setLeaves(res);
        } catch {
            alert("Failed to load leave requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
        const socket = getSocket();
        if (socket) {
            const refresh = () => fetchLeaves();
            socket.on("leave:created", refresh);
            return () => socket.off("leave:created", refresh);
        }
    }, [status]);

    const handleApprove = async (id) => {
        await approveLeave(id);
        fetchLeaves();
    };

    const handleReject = async (id) => {
        await rejectLeave(id);
        fetchLeaves();
    };

    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    const getStatusBadge = (status) => {
        if(status === 'Approved') return "bg-green-100 text-green-700 border-green-200";
        if(status === 'Rejected') return "bg-red-100 text-red-700 border-red-200";
        return "bg-amber-100 text-amber-700 border-amber-200";
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto pb-10 space-y-6">
                
                {/* Header & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">Review and manage employee time-off requests.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 font-medium">Filter:</span>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 border min-w-[140px]"
                        >
                            <option value="">All Requests</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading && <p className="p-10 text-center text-slate-500 animate-pulse">Loading requests...</p>}
                        
                        {!loading && leaves.length === 0 && (
                            <div className="p-12 text-center text-slate-500">
                                <p>No leave requests matching your filter.</p>
                            </div>
                        )}

                        {!loading && leaves.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Dates</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {leaves.map((leave) => (
                                        <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{leave.employee.name}</div>
                                                <div className="text-xs text-slate-500">{leave.leaveType} Leave</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                {formatDate(leave.startDate)} <span className="text-slate-300 mx-1">→</span> {formatDate(leave.endDate)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={leave.reason}>
                                                {leave.reason || <span className="italic text-slate-400">None</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBadge(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {leave.status === "Pending" ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(leave._id)}
                                                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-bold border border-green-200 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(leave._id)}
                                                            className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold border border-red-200 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Leaves;