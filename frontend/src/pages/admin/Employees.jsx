import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAllEmployees, deleteEmployee } from "../../services/employeeService";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { toastError, toastSuccess } from "../../utils/toast";
import useAsync from "../../hooks/useAsync";
import useConfirmAction from "../../hooks/useConfirmAction";

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const fetcher = useAsync(async () => {
        const data = await getAllEmployees();
        setEmployees(data);
    });
    const deleteConfirm = useConfirmAction();

    useEffect(() => {
        fetcher.run().catch(() => {});
    }, []);

    const handleDelete = async () => {
        try {
            await deleteConfirm.run(async () => {
                await deleteEmployee(deleteConfirm.target._id);
            });
            toastSuccess("Employee deleted");
            deleteConfirm.close();
            fetcher.run().catch(() => {});
        } catch {
            toastError("Failed to delete employee");
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your workforce directory</p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/employees/create")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <span className="text-lg leading-none">+</span>
                        Add Employee
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {fetcher.loading && <div className="p-4"><TableSkeleton rows={6} /></div>}

                        {!fetcher.loading && employees.length === 0 && (
                            <div className="p-10 text-center text-slate-500">
                                <p>No employees found within the organization.</p>
                            </div>
                        )}

                        {!fetcher.loading && employees.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Employee Name</th>
                                        <th className="px-6 py-4">Role & Dept</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 text-base">{emp.name}</span>
                                                    <span className="text-slate-500 text-xs">{emp.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium 
                                                        ${emp.role === "HR" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                                                        {emp.role}
                                                    </span>
                                                    <span className="text-slate-600 text-xs">{emp.department || "General"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                                    ${emp.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? "bg-green-600" : "bg-red-600"}`}></span>
                                                    {emp.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/admin/employees/${emp._id}`)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline transition-all"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => deleteConfirm.confirm(emp)}
                                                        className="text-rose-600 hover:text-rose-800 font-medium text-sm hover:underline transition-all"
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
            <ConfirmModal
                open={deleteConfirm.open}
                title="Delete Employee"
                message={`This will permanently delete ${deleteConfirm.target?.name}. This action cannot be undone.`}
                onCancel={deleteConfirm.close}
                onConfirm={handleDelete}
                loading={deleteConfirm.loading}
                loadingLabel="Deleting employee..."
                icon="Trash2"
            />
        </MainLayout>
    );
};

export default Employees;
