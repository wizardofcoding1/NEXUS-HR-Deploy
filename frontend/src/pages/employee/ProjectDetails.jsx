import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
    getProjectById,
    assignEmployeesToProject,
    unassignEmployeesFromProject
} from "../../services/projectService";
import { getAllEmployees } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";
import { useAuthStore } from "../../store/authStore";

const EmployeeProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [project, setProject] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const proj = await getProjectById(id);
                setProject(proj);
                const list = await getAllEmployees();
                setEmployees(Array.isArray(list) ? list : []);
            } catch {
                toastError("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleConfirmTeam = async () => {
        if (selectedEmployees.length === 0) return toastError("Please select at least one employee");

        try {
            await assignEmployeesToProject(project._id, selectedEmployees);
            toastSuccess("Team assigned successfully");

            const assigned = employees.filter((e) => selectedEmployees.includes(e._id));
            setProject((prev) => ({
                ...prev,
                employees: [...(prev.employees || []), ...assigned],
            }));

            // Optimistic update for local state logic if needed elsewhere
            setEmployees((prev) =>
                prev.map((emp) => {
                    if (!selectedEmployees.includes(emp._id)) return emp;
                    return { ...emp, projectWorking: [...(emp.projectWorking || []), project] };
                })
            );
            setSelectedEmployees([]);
        } catch (error) {
            toastError(error?.response?.data?.message || "Failed to assign team");
        }
    };

    if (loading) return <MainLayout><div className="p-12 text-center text-slate-500 animate-pulse">Loading project details...</div></MainLayout>;
    if (!project) return <MainLayout><div className="p-12 text-center text-red-500">Project not found</div></MainLayout>;

    const isProjectLeader = user.teamLeader && project.teamLeader?._id === user._id;
    const canManageTeam = isProjectLeader || user.role === "HR" || user.role === "Admin";

    const availableEmployees = employees.filter((emp) => {
        const alreadyAssigned = project.employees?.some((assigned) => assigned._id === emp._id);
        const maxProjects = emp.maxActiveProjects || 2;
        const currentProjects = emp.projectWorking?.length || 0;
        const slotsFull = project.slotCount && (project.employees?.length || 0) >= project.slotCount;

        return (
            emp.role === "Employee" &&
            !emp.teamLeader &&
            emp._id !== project.teamLeader?._id &&
            !alreadyAssigned &&
            !slotsFull &&
            currentProjects < maxProjects
        );
    });

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-10 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <button
                        onClick={() => navigate("/employee/projects")}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                        <span>&larr;</span> Back to My Projects
                    </button>
                    {project.status === "Ongoing" && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                            Active Project
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Project Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{project.projectName}</h1>
                            <p className="text-sm text-slate-500 mb-6">{project.client}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                    <p className="font-medium text-slate-800">{project.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timeline</p>
                                    <p className="text-sm text-slate-700">
                                        {new Date(project.startDate).toLocaleDateString()} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Ongoing"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Team Capacity</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full" 
                                                style={{ width: `${Math.min(((project.employees?.length || 0) / (project.slotCount || 10)) * 100, 100)}%` }} 
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">
                                            {project.employees?.length || 0} / {project.slotCount || "∞"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Team Leader</h2>
                            {project.teamLeader ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {project.teamLeader.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{project.teamLeader.name}</p>
                                        <p className="text-xs text-slate-500">{project.teamLeader.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No leader assigned.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Team Management */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Team Members</h2>
                            {project.teamLocked && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                    Team Locked
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            {project.employees?.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Employee</th>
                                            <th className="px-6 py-3">Department</th>
                                            <th className="px-6 py-3">Position</th>
                                            {canManageTeam && !project.teamLocked && <th className="px-6 py-3 text-right">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {project.employees.map((emp) => (
                                            <tr key={emp._id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-3 font-medium text-slate-900">{emp.name}</td>
                                                <td className="px-6 py-3 text-slate-600">{emp.department}</td>
                                                <td className="px-6 py-3 text-slate-600">{emp.position}</td>
                                                {canManageTeam && !project.teamLocked && (
                                                    <td className="px-6 py-3 text-right">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await unassignEmployeesFromProject(project._id, [emp._id]);
                                                                    setProject((prev) => ({
                                                                        ...prev,
                                                                        employees: (prev.employees || []).filter((e) => e._id !== emp._id),
                                                                    }));
                                                                    toastSuccess("Member removed");
                                                                } catch {
                                                                    toastError("Failed to remove member");
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-800 text-xs font-medium hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">No team members currently assigned.</div>
                            )}
                        </div>

                        {/* Add Members Section */}
                        {canManageTeam && !project.teamLocked && project.status !== "Completed" && (
                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Add Team Members</h3>
                                {availableEmployees.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {availableEmployees.map((emp) => (
                                                <label key={emp._id} className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployees.includes(emp._id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setSelectedEmployees((prev) =>
                                                                checked ? [...prev, emp._id] : prev.filter((id) => id !== emp._id)
                                                            );
                                                        }}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{emp.name}</p>
                                                        <p className="text-xs text-slate-400 truncate">{emp.employeeId}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleConfirmTeam}
                                            disabled={selectedEmployees.length === 0}
                                            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                                        >
                                            Add Selected Members ({selectedEmployees.length})
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500 italic bg-white p-3 rounded border border-dashed border-slate-300">
                                        No eligible employees available to add (Check if they are already in a team or have reached max project capacity).
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EmployeeProjectDetails;