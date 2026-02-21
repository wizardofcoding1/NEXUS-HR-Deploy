import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/interceptors";
import { getSocket } from "../../services/socket";

const EmployeeLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get("/leaves/me");
            setLeaves(res.data.data);
        } catch {
            alert("Failed to load leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
        const socket = getSocket();
        if (socket) {
            const refresh = () => fetchLeaves();
            socket.on("leave:status", refresh);
            return () => socket.off("leave:status", refresh);
        }
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const today = new Date().toISOString().split("T")[0];
        if (form.startDate && form.startDate < today) return alert("Start date cannot be in the past");
        if (form.endDate && form.endDate < today) return alert("End date cannot be in the past");
        if (form.startDate && form.endDate && form.endDate < form.startDate) return alert("End date cannot be before start date");

        try {
            await api.post("/leaves", form);
            fetchLeaves();
            setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
        } catch {
            alert("Failed to apply leave");
        }
    };

    const getStatusStyles = (status) => {
        if (status === "Approved") return "bg-green-100 text-green-700 border-green-200";
        if (status === "Rejected") return "bg-red-100 text-red-700 border-red-200";
        return "bg-amber-100 text-amber-700 border-amber-200";
    };

    const formatDate = (value) => value ? new Date(value).toLocaleDateString() : "-";
    const today = new Date().toISOString().split("T")[0];

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-10 space-y-8">
                
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
                    <p className="text-sm text-slate-500">Request time off and track your leave history.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Apply Leave Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">New Request</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                    <select name="leaveType" value={form.leaveType} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border bg-white">
                                        <option value="">Select Type...</option>
                                        <option value="Casual">Casual Leave</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Paid">Paid Leave</option>
                                        <option value="Unpaid">Unpaid Leave</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                                        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required min={today} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border text-slate-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                                        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required min={form.startDate || today} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border text-slate-600" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                    <textarea name="reason" value={form.reason} onChange={handleChange} rows="3" className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border resize-none" placeholder="Brief reason for leave..." />
                                </div>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors text-sm">
                                    Submit Request
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Leave History List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">History</h2>
                            </div>
                            
                            {loading && <p className="p-8 text-center text-slate-500 animate-pulse">Loading records...</p>}
                            {!loading && leaves.length === 0 && <p className="p-10 text-center text-slate-500">No leave requests found.</p>}
                            
                            {!loading && leaves.length > 0 && (
                                <div className="divide-y divide-slate-100">
                                    {leaves.map((leave) => (
                                        <div key={leave._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-slate-800">{leave.leaveType} Leave</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyles(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-1">
                                                    {formatDate(leave.startDate)} <span className="text-slate-300 mx-1">→</span> {formatDate(leave.endDate)}
                                                </p>
                                                {leave.reason && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 inline-block">{leave.reason}</p>}
                                            </div>
                                            <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                                {leave.status === "Pending" ? "Awaiting Approval" : `Processed`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EmployeeLeaves;