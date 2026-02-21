import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
    getAllEmployees,
    toggleEmployeeStatus,
    deleteEmployee,
} from "../../services/employeeService";
import TableSkeleton from "../../components/ui/TableSkeleton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { toastError, toastSuccess } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import useAsync from "../../hooks/useAsync";
import useConfirmAction from "../../hooks/useConfirmAction";

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);

    const fetcher = useAsync(async () => {
        const data = await getAllEmployees();
        setEmployees(data);
    });

    const toggleConfirm = useConfirmAction();
    const deleteConfirm = useConfirmAction();

    useEffect(() => {
        fetcher.run().catch(() => {});
    }, []);

    const handleToggleStatus = async () => {
        try {
            await toggleConfirm.run(async () => {
                await toggleEmployeeStatus(
                    toggleConfirm.target._id,
                    !toggleConfirm.target.isActive,
                );
            });
            toastSuccess(
                toggleConfirm.target.isActive
                    ? "Employee deactivated"
                    : "Employee activated",
            );
            toggleConfirm.close();
            fetcher.run().catch(() => {});
        } catch {
            toastError("Failed to update status");
        }
    };

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
            <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Employee Directory
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage staff, roles, and account access.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/hr/employees/create")}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">+</span> Add
                        Employee
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {fetcher.loading && (
                            <div className="p-6">
                                <TableSkeleton rows={6} />
                            </div>
                        )}

                        {!fetcher.loading && fetcher.error && (
                            <div className="p-10 text-center text-red-500">
                                Failed to load employees
                            </div>
                        )}

                        {!fetcher.loading &&
                            employees.length === 0 &&
                            !fetcher.error && (
                                <div className="p-12 text-center text-slate-500">
                                    No employees found. Start by adding one.
                                </div>
                            )}

                        {!fetcher.loading && employees.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Employee Details
                                        </th>
                                        <th className="px-6 py-4">
                                            Department
                                        </th>
                                        <th className="px-6 py-4">
                                            Account Status
                                        </th>
                                        <th className="px-6 py-4">
                                            Activation
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.map((emp) => (
                                        <tr
                                            key={emp._id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-900">
                                                            {emp.name}
                                                        </span>
                                                        {emp.teamLeader && (
                                                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                                                                TL
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {emp.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {emp.department || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${emp.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                                                >
                                                    {emp.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 text-xs font-medium 
                                                    ${emp.isActivated ? "text-emerald-600" : "text-amber-600"}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${emp.isActivated ? "bg-emerald-500" : "bg-amber-500"}`}
                                                    ></span>
                                                    {emp.isActivated
                                                        ? "Verified"
                                                        : "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/hr/employees/${emp._id}`,
                                                            )
                                                        }
                                                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium hover:underline"
                                                    >
                                                        Profile
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            toggleConfirm.confirm(
                                                                emp,
                                                            )
                                                        }
                                                        className={`text-xs font-medium hover:underline ${emp.isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}`}
                                                    >
                                                        {emp.isActive
                                                            ? "Disable"
                                                            : "Enable"}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteConfirm.confirm(
                                                                emp,
                                                            )
                                                        }
                                                        className="text-xs font-medium hover:underline text-rose-600 hover:text-rose-800"
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

                <ConfirmModal
                    open={toggleConfirm.open}
                    title={
                        toggleConfirm.target?.isActive
                            ? "Deactivate Account"
                            : "Activate Account"
                    }
                    message={`Are you sure you want to ${toggleConfirm.target?.isActive ? "deactivate" : "activate"} ${toggleConfirm.target?.name}? They will ${toggleConfirm.target?.isActive ? "lose" : "gain"} system access.`}
                    onCancel={toggleConfirm.close}
                    onConfirm={handleToggleStatus}
                    loading={toggleConfirm.loading}
                    loadingLabel="Updating status..."
                    icon="Trash2"
                />
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
            </div>
        </MainLayout>
    );
};

export default Employees;
