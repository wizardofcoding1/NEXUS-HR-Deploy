import { useEffect, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import MainLayout from "../../layouts/MainLayout";
import { getHRs, createHR, toggleHRStatus } from "../../services/adminService";
import { deleteEmployee } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Button from "../../components/ui/Button";
import useFilters from "../../hooks/useFilters";
import useForm from "../../hooks/useForm";
import useAsync from "../../hooks/useAsync";

const HRManagement = () => {
    const [hrs, setHrs] = useState([]);
    const [generated, setGenerated] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const { filters, setFilters } = useFilters({
        status: "",
        department: "",
        shift: "",
    });

    const { values: form, setValues: setForm, handleChange } = useForm({
        name: "",
        personalEmail: "",
        phone: "",
        department: "Human Resources",
        position: "HR Manager",
        dateOfJoining: "",
        aadharNumber: "",
        panNumber: "",
        shift: "Morning",
        shiftType: "Fixed",
        autoGeneratePassword: true,
        password: "",
    });

    const fetcher = useAsync(async (nextFilters) => {
        const res = await getHRs(nextFilters || filters);
        setHrs(res.data || []);
    });

    useEffect(() => {
        fetcher.run(filters).catch(() => toastError("Failed to load HR list"));
    }, [filters]);

    const generatePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        let out = "";
        for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
        return `${out}@${Math.floor(10 + Math.random() * 90)}`;
    };

    const handleCreateHR = async (e) => {
        e.preventDefault();
        if (creating) return;
        setCreating(true);
        try {
            const payload = { ...form };
            if (form.autoGeneratePassword || !form.password) delete payload.password;
            delete payload.autoGeneratePassword;
            
            const res = await createHR(payload);
            fetcher.run(filters).catch(() => {});
            setGenerated(res.data);
            toastSuccess("HR created successfully");
            if (res?.data?.emailError) toastError(`Email not sent: ${res.data.emailError}`);
            
            setForm({
                name: "", personalEmail: "", phone: "", department: "Human Resources",
                position: "HR Manager", dateOfJoining: "", aadharNumber: "", panNumber: "",
                shift: "Morning", shiftType: "Fixed", autoGeneratePassword: true, password: "",
            });
        } catch (error) {
            toastError(error?.response?.data?.message || "Failed to create HR");
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (id) => {
        await toggleHRStatus(id);
        fetcher.run(filters).catch(() => {});
    };

    const confirmDelete = (hr) => {
        setDeleteTarget(hr);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteEmployee(deleteTarget._id);
            toastSuccess("HR deleted");
            setDeleteOpen(false);
            setDeleteTarget(null);
            fetcher.run(filters).catch(() => {});
        } catch {
            toastError("Failed to delete HR");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-800">HR Management</h1>
                    <p className="text-slate-500 text-sm">Create and manage Human Resource personnel.</p>
                </div>

                {generated && (
                    <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="flex items-center justify-center w-6 h-6 bg-green-200 text-green-700 rounded-full text-xs font-bold">✓</span>
                            <h3 className="font-bold text-lg">HR Account Created</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-white/60 p-4 rounded-lg border border-green-100">
                            <div><span className="text-green-700 font-semibold block text-xs uppercase">Employee ID</span> {generated.employeeId}</div>
                            <div><span className="text-green-700 font-semibold block text-xs uppercase">Company Email</span> {generated.email}</div>
                            <div><span className="text-green-700 font-semibold block text-xs uppercase">Password</span> <span className="font-mono bg-green-100 px-1 rounded">{generated.password}</span></div>
                            <div><span className="text-green-700 font-semibold block text-xs uppercase">Status</span> {generated.emailError ? "Email Failed" : "Email Sent"}</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* LEFT COL: Create Form */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">Onboard New HR</h2>
                            </div>
                            <form onSubmit={handleCreateHR} className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Info</h3>
                                    <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                    <input name="personalEmail" type="email" placeholder="Personal Email" value={form.personalEmail} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                    <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Details</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                        <input name="position" placeholder="Position" value={form.position} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={handleChange} required className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 border outline-none" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <select name="shift" value={form.shift} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-2 py-2 text-sm bg-white border outline-none">
                                                <option value="Morning">Morning</option>
                                                <option value="Evening">Evening</option>
                                                <option value="Night">Night</option>
                                            </select>
                                            <select name="shiftType" value={form.shiftType} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-2 py-2 text-sm bg-white border outline-none">
                                                <option value="Fixed">Fixed</option>
                                                <option value="Flexible">Flex</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="aadharNumber" placeholder="Aadhar No." value={form.aadharNumber} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                        <input name="panNumber" placeholder="PAN No." value={form.panNumber} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-700">Password</label>
                                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                            <input type="checkbox" name="autoGeneratePassword" checked={form.autoGeneratePassword} onChange={(e) => setForm({ ...form, autoGeneratePassword: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                                            Auto-generate
                                        </label>
                                    </div>
                                    {!form.autoGeneratePassword && (
                                        <div className="flex gap-2">
                                            <input type="text" name="password" placeholder="Enter password" value={form.password} onChange={handleChange} className="flex-1 border-slate-300 rounded-lg px-3 py-2 text-sm border outline-none" />
                                            <button type="button" onClick={() => setForm({ ...form, password: generatePassword() })} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50">Generate</button>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={creating}
                                    loadingLabel="Creating HR..."
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <FiUserPlus />
                                        Create HR Account
                                    </span>
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COL: List & Filters */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border bg-white">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <input value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} placeholder="Filter by Department..." className="border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" />
                                <select value={filters.shift} onChange={(e) => setFilters({ ...filters, shift: e.target.value })} className="border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border bg-white">
                                    <option value="">All Shifts</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                    <option value="Night">Night</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                {fetcher.loading && <p className="p-8 text-center text-slate-500">Loading directory...</p>}
                                {!fetcher.loading && hrs.length === 0 && <p className="p-8 text-center text-slate-500">No HR records found.</p>}
                                {!fetcher.loading && hrs.length > 0 && (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Profile</th>
                                                <th className="px-6 py-4">Contact</th>
                                                <th className="px-6 py-4">Shift</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {hrs.map((hr) => (
                                                <tr key={hr._id} className="hover:bg-slate-50/80">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">{hr.name}</span>
                                                            <span className="text-xs text-slate-500">{hr.department}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col text-xs text-slate-600 gap-0.5">
                                                            <span>{hr.email}</span>
                                                            <span>{hr.phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{hr.shift || "-"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                                            ${hr.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                            {hr.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleToggle(hr._id)} 
                                                                className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors
                                                                    ${hr.isActive ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                                                            >
                                                                {hr.isActive ? "Disable" : "Enable"}
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDelete(hr)}
                                                                className="text-xs font-medium px-3 py-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
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
            </div>
            <ConfirmModal
                open={deleteOpen}
                title="Delete HR"
                message={`This will permanently delete ${deleteTarget?.name}. This action cannot be undone.`}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                loading={deleting}
                loadingLabel="Deleting HR..."
                icon="Trash2"
            />
        </MainLayout>
    );
};

export default HRManagement;
