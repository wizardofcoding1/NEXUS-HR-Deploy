import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
    getProjectById,
    assignEmployeesToProject,
    unassignEmployeesFromProject,
    updateProject
} from "../../services/projectService";
import { getAllEmployees } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";
import { useAuthStore } from "../../store/authStore";
import { getMeApi } from "../../services/authServices";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();

    const [project, setProject] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [slotCountInput, setSlotCountInput] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const proj = await getProjectById(id);
                setProject(proj);
                setSlotCountInput(typeof proj?.slotCount === "number" ? String(proj.slotCount) : "");
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
            setProject((prev) => ({ ...prev, employees: [...(prev.employees || []), ...assigned] }));
            setEmployees((prev) => prev.map((emp) => {
                if (!selectedEmployees.includes(emp._id)) return emp;
                return { ...emp, projectWorking: [...(emp.projectWorking || []), project] };
            }));
            setSelectedEmployees([]);
        } catch (error) {
            toastError(error?.response?.data?.message || "Failed to assign team");
        }
    };

    const handleTeamLeaderChange = async (empId) => {
        try {
            const updated = await updateProject(project._id, { teamLeader: empId });
            toastSuccess("Team Leader updated");
            const selected = employees.find((e) => e._id === empId);
            setProject((prev) => ({ ...prev, teamLeader: selected || updated?.teamLeader || empId }));
            
            if (user?._id === empId) {
                const me = await getMeApi();
                if (me?.data) setUser(me.data);
            }
        } catch {
            toastError("Failed to update Team Leader");
        }
    };

    if (loading) return <MainLayout><div className="p-10 text-center animate-pulse text-slate-500">Loading details...</div></MainLayout>;
    if (!project) return <MainLayout><div className="p-10 text-center text-red-500">Project not found</div></MainLayout>;

    const isProjectLeader = user.teamLeader && project.teamLeader?._id === user._id;
    const isCompleted = project.status === "Completed";
    const canManageTeam = (user.role === "HR" || user.role === "Admin" || isProjectLeader) && !isCompleted;
    const canEditStatus = canManageTeam && !isCompleted;

    const eligibleTeamLeaders = employees.filter((emp) => emp.role === "Employee" && !emp.teamLeader);
    
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
            <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <button onClick={() => navigate("/admin/projects")} className="hover:text-blue-600">Projects</button>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">Details</span>
                    </div>
                    {canEditStatus && (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-xs font-bold text-slate-500 px-2 uppercase">Status:</span>
                            <select
                                className={`text-sm font-medium outline-none bg-transparent py-1 pr-2 rounded
                                    ${project.status === 'Ongoing' ? 'text-blue-600' : 
                                      project.status === 'Completed' ? 'text-green-600' : 'text-slate-600'}`}
                                value={project.status}
                                onChange={async (e) => {
                                    try {
                                        const updated = await updateProject(project._id, { status: e.target.value });
                                        setProject((prev) => ({ ...prev, status: updated.status }));
                                        toastSuccess("Status updated");
                                    } catch {
                                        toastError("Failed to update status");
                                    }
                                }}
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Info & Leader */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{project.projectName}</h1>
                            <p className="text-slate-500 text-sm mb-6">{project.client}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Timeline</p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {new Date(project.startDate).toLocaleDateString()} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Ongoing"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Team Capacity</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-slate-700">
                                            {project.employees?.length || 0} / {project.slotCount || "∞"} Members
                                        </p>
                                        {user.role === "Admin" && !isCompleted && (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={slotCountInput}
                                                    onChange={(e) => setSlotCountInput(e.target.value)}
                                                    className="w-12 text-xs border border-slate-300 rounded px-1 py-0.5"
                                                />
                                                <button 
                                                    onClick={async () => {
                                                        if (!slotCountInput) return;
                                                        try {
                                                            const updated = await updateProject(project._id, { slotCount: Number(slotCountInput) });
                                                            setProject(prev => ({ ...prev, slotCount: updated.slotCount }));
                                                            toastSuccess("Capacity updated");
                                                        } catch {
                                                            toastError("Failed update");
                                                        }
                                                    }}
                                                    className="text-xs bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"
                                                >
                                                    Set
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Team Leader</h3>
                            {project.teamLeader ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                        {project.teamLeader.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{project.teamLeader.name}</p>
                                        <p className="text-xs text-slate-500">{project.teamLeader.employeeId}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No Team Leader assigned</p>
                            )}

                            {canManageTeam && !project.teamLeader && !project.teamLocked && (
                                <div className="mt-4">
                                    <select
                                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        onChange={(e) => {
                                            if(e.target.value) handleTeamLeaderChange(e.target.value);
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a Leader...</option>
                                        {eligibleTeamLeaders.map((emp) => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name} ({emp.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Team Management */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Project Team</h2>
                            {project.teamLocked && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-medium">Locked</span>}
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Member</th>
                                        <th className="px-6 py-3">Department</th>
                                        <th className="px-6 py-3">Position</th>
                                        {canManageTeam && !project.teamLocked && <th className="px-6 py-3 text-right">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {project.employees?.length > 0 ? project.employees.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 font-medium text-slate-900">{emp.name}</td>
                                            <td className="px-6 py-3 text-slate-600">{emp.department}</td>
                                            <td className="px-6 py-3 text-slate-600">{emp.position}</td>
                                            {canManageTeam && !project.teamLocked && (
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await unassignEmployeesFromProject(project._id, [emp._id]);
                                                                setProject((prev) => ({ ...prev, employees: prev.employees.filter((e) => e._id !== emp._id) }));
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
                                    )) : (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No team members assigned yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Members Section */}
                        {canManageTeam && !project.teamLocked && (
                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Add Team Members</h3>
                                {availableEmployees.length > 0 ? (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 max-h-40 overflow-y-auto pr-2">
                                            {availableEmployees.map((emp) => (
                                                <label key={emp._id} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded cursor-pointer hover:border-blue-300 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployees.includes(emp._id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setSelectedEmployees(prev => checked ? [...prev, emp._id] : prev.filter(id => id !== emp._id));
                                                        }}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700 truncate">{emp.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleConfirmTeam}
                                            disabled={selectedEmployees.length === 0}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                                        >
                                            Add Selected ({selectedEmployees.length})
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No eligible employees available to add (Check capacity or workload).</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProjectDetails;