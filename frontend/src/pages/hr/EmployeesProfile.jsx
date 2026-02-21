import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getEmployeeById, updateEmployee } from "../../services/employeeService";
import { toastError } from "../../utils/toast";

const EmployeesProfile = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [shift, setShift] = useState("Morning");
    const [savingShift, setSavingShift] = useState(false);

    useEffect(() => {
        getEmployeeById(id)
            .then((data) => {
                setEmployee(data);
                setShift(data?.shift || "Morning");
            })
            .catch(() => toastError("Failed to load employee"));
    }, [id]);

    if (!employee) {
        return (
            <MainLayout>
                <div className="p-12 text-center text-slate-500 animate-pulse">Loading profile...</div>
            </MainLayout>
        );
    }

    const reportsToText = employee.teamLeader
        ? "Reports to HR"
        : employee.reportsTo
            ? `${employee.reportsTo.name} (${employee.reportsTo.employeeId})`
            : "Not assigned";

    const handleShiftUpdate = async () => {
        try {
            setSavingShift(true);
            const updated = await updateEmployee(id, { shift });
            setEmployee(updated);
        } catch (error) {
            toastError(error?.response?.data?.message || "Failed to update shift");
        } finally {
            setSavingShift(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                            {employee.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 leading-tight">{employee.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-sm font-medium text-slate-500">{employee.employeeId}</span>
                                <span className="text-slate-300">�</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                                    ${employee.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {employee.isActive ? "Active" : "Inactive"}
                                </span>
                                {employee?.teamLeader && (
                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        Team Leader
                                    </span>
                                )}
                                {!employee?.isActivated && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        Pending Activation
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Employee Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                            <InfoItem label="Full Name" value={employee.name} />
                            <InfoItem label="Employee ID" value={employee.employeeId} />
                            <InfoItem label="Role" value={employee.role} />

                            <InfoItem label="Work Email" value={employee.email} />
                            <InfoItem label="Department" value={employee.department} />
                            <InfoItem label="Position" value={employee.position} />

                            <InfoItem label="Shift" value={employee.shift} />
                            <InfoItem label="Shift Type" value={employee.shiftType} />
                            <InfoItem label="Reports To" value={reportsToText} />

                            <InfoItem label="Date of Joining" value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "-"} />
                            <InfoItem label="Employment Status" value={employee.employmentStatus} />
                            <InfoItem label="Team Leader" value={employee.teamLeader ? "Yes" : "No"} />
                        </div>
                        <div className="px-6 pb-6">
                            <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Update Shift</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                        value={shift}
                                        onChange={(e) => setShift(e.target.value)}
                                        className="w-full sm:w-60 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleShiftUpdate}
                                        disabled={savingShift || shift === employee.shift}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {savingShift ? "Saving..." : "Save Shift"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Personal Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                            <InfoItem label="Personal Email" value={employee.personalEmail} />
                            <InfoItem label="Phone" value={employee.phone} />
                            <InfoItem label="Aadhar Number" value={employee.aadharNumber} />
                            <InfoItem label="PAN Number" value={employee.panNumber} />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wide">{label}</p>
        <p className="font-medium text-slate-800 text-sm break-words">{value || <span className="text-slate-300">-</span>}</p>
    </div>
);

export default EmployeesProfile;
