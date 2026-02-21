import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
    getEmployeeById,
} from "../../services/employeeService";
import { toastError } from "../../utils/toast";
import BankDetailsPersonal from "../Components/BankDetails/BankDetailsPersonal";
import AttendanceCalendar from "../../components/attendance/AttendanceCalendar";
import { getAttendanceByEmployee } from "../../services/attendanceService";
import useAsync from "../../hooks/useAsync";

const EmployeeProfile = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [attendanceMonth, setAttendanceMonth] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const employeeLoader = useAsync(async (employeeId) => {
        const data = await getEmployeeById(employeeId);
        setEmployee(data);
    });

    const attendanceLoader = useAsync(async (employeeId, monthKey) => {
        const res = await getAttendanceByEmployee(employeeId, { month: monthKey });
        setAttendanceRecords(res.data || []);
    });

    useEffect(() => {
        employeeLoader.run(id).catch(() => toastError("Failed to load employee"));
    }, [id]);

    useEffect(() => {
        const month = `${attendanceMonth.getFullYear()}-${String(
            attendanceMonth.getMonth() + 1,
        ).padStart(2, "0")}`;
        attendanceLoader.run(id, month).catch(() => {});
    }, [id, attendanceMonth]);

    if (!employee) return <MainLayout><div className="p-8 text-center text-slate-500">Loading profile...</div></MainLayout>;

    const reportsToText = employee.teamLeader
        ? "Reports to HR"
        : employee.reportsTo
            ? `${employee.reportsTo.name} (${employee.reportsTo.employeeId})`
            : "Not assigned";

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow">
                            {employee.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 leading-none">{employee.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-slate-500">{employee.employeeId}</span>
                                <span className="text-slate-300">•</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${employee.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {employee.isActive ? "Active" : "Inactive"}
                                </span>
                                {employee?.teamLeader && (
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                        Team Leader
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowBankDetails((prev) => !prev)}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
                        >
                            {showBankDetails ? "Hide Bank Info" : "View Bank Info"}
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Left Column: Profile Info */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        {/* Profile Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">Personal & Work Information</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                <InfoItem label="Email" value={employee.email} />
                                <InfoItem label="Phone" value={employee.phone} />
                                <InfoItem label="Position" value={employee.position} />
                                
                                <InfoItem label="Date of Joining" value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toDateString() : "-"} />
                                <InfoItem label="Employment Status" value={employee.employmentStatus} />
                                <InfoItem label="Reports To" value={reportsToText} />
                                
                                <InfoItem label="Aadhar Number" value={employee.aadharNumber} />
                                <InfoItem label="PAN Number" value={employee.panNumber} />
                                <InfoItem label="Login Attempts" value={employee.loginAttempts ?? 0} />
                            </div>
                        </div>

                        {/* Bank Details Dropdown */}
                        {showBankDetails && (
                            <BankDetailsPersonal
                                title="Bank Details"
                                employeeId={employee._id}
                                canEdit={false}
                            />
                        )}

                        {/* Projects Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                                <span>Active Projects</span>
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                    {employee.projectWorking?.length || 0} / {employee.maxActiveProjects || "-"} Max
                                </span>
                            </h2>
                            {employee.projectWorking?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {employee.projectWorking.map((project) => (
                                        <div key={project._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <p className="font-semibold text-slate-800">{project.projectName}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs">
                                                <span className={`px-2 py-0.5 rounded capitalize ${
                                                    project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {project.status}
                                                </span>
                                                {project.teamLeader && <span className="text-slate-500">TL: {project.teamLeader.name}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-sm">
                                    No active projects assigned.
                                </div>
                            )}

                             {/* Project History */}
                             <div className="mt-8 pt-6 border-t border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Project History</h3>
                                {employee.projectHistory?.length > 0 ? (
                                    <ul className="divide-y divide-slate-100 text-sm">
                                        {employee.projectHistory.map((project) => (
                                            <li key={project._id} className="py-2 flex justify-between">
                                                <span className="text-slate-700">{project.projectName}</span>
                                                <span className="text-slate-500 italic">{project.status}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No past project history.</p>
                                )}
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Management & Attendance */}
                    <div className="space-y-6">
                        
                        {/* Management Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="font-bold text-slate-800 mb-2">Admin View</h2>
                            <p className="text-sm text-slate-500">
                                Admin accounts have read-only access to employee and HR profiles.
                            </p>
                        </div>

                        {/* Attendance Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="font-bold text-slate-800">Attendance</h2>
                                <div className="flex items-center gap-1 text-sm">
                                    <button 
                                        onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() - 1, 1))}
                                        className="p-1 hover:bg-slate-100 rounded"
                                    >←</button>
                                    <span className="font-medium min-w-[100px] text-center">
                                        {attendanceMonth.toLocaleString("default", { month: "short", year: "numeric" })}
                                    </span>
                                    <button 
                                        onClick={() => setAttendanceMonth(new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() + 1, 1))}
                                        className="p-1 hover:bg-slate-100 rounded"
                                    >→</button>
                                </div>
                            </div>
                            <div className="p-4">
                                <AttendanceCalendar
                                    monthDate={attendanceMonth}
                                    records={attendanceRecords}
                                    selectedDate={new Date()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// Helper for displaying profile info cleanly
const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="font-medium text-slate-800 text-sm break-words">{value || <span className="text-slate-300">-</span>}</p>
    </div>
);

export default EmployeeProfile;
