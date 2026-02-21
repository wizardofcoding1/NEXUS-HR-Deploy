import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getProjectById, assignEmployeesToProject, unassignEmployeesFromProject, updateProject } from "../../services/projectService";
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
    const [descriptionInput, setDescriptionInput] = useState("");
    const [endDateInput, setEndDateInput] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const proj = await getProjectById(id);
                setProject(proj);
                setSlotCountInput(typeof proj?.slotCount === "number" ? String(proj.slotCount) : "");
                setDescriptionInput(proj?.description || "");
                setEndDateInput(proj?.endDate ? new Date(proj.endDate).toISOString().split("T")[0] : "");
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
            toastSuccess("Team assigned");
            
            // Refresh local state to show new members
            const assigned = employees.filter((e) => selectedEmployees.includes(e._id));
            setProject((prev) => ({
                ...prev,
                employees: [...(prev.employees || []), ...assigned],
            }));
            
            // Update employees list state for correct filtering
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
            
            // Refetch current user if they assigned themselves to update permissions in UI
            if (user?._id === empId) {
                const me = await getMeApi();
                if (me?.data) setUser(me.data);
            }
        } catch {
            toastError("Failed to update Team Leader");
        }
    };

    if (loading) return <MainLayout><div className="p-12 text-center text-slate-500 animate-pulse">Loading project details...</div></MainLayout>;
    if (!project) return <MainLayout><div className="p-12 text-center text-red-500">Project not found</div></MainLayout>;

    const backLink = user.role === "HR" || user.role === "Admin" ? "/hr/projects" : "/employee/projects";
    const isProjectLeader = user.teamLeader && project.teamLeader?._id === user._id;
    const isCompleted = project.status === "Completed";
    const canManageTeam = (user.role === "HR" || user.role === "Admin" || isProjectLeader) && !isCompleted;
    const canEditProject = (user.role === "HR" || user.role === "Admin") && !isCompleted;

    const availableEmployees = employees.filter((emp) => {
        const alreadyAssigned = project.employees?.some((assigned) => assigned._id === emp._id);
        const maxProjects = emp.maxActiveProjects || 2;
        const currentProjects = emp.projectWorking?.length || 0;
        const slotsFull = project.slotCount && (project.employees?.length || 0) >= project.slotCount;

        return (
            emp.role === "Employee" && !emp.teamLeader &&
            emp._id !== project.teamLeader?._id && !alreadyAssigned &&
            !slotsFull && currentProjects < maxProjects
        );
    });

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-10 space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(backLink)} className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                        <span>&larr;</span> Back to Projects
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{project.projectName}</h1>
                            <p className="text-sm text-slate-500 mb-4">{project.client}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                                    {canEditProject ? (
                                        <select
                                            className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                            value={project.status}
                                            onChange={async (e) => {
                                                try {
                                                    const updated = await updateProject(project._id, { status: e.target.value });
                                                    setProject(prev => ({ ...prev, status: updated.status }));
                                                    toastSuccess("Status updated");
                                                } catch { toastError("Failed update"); }
                                            }}
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{project.status}</span>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                                    {canEditProject ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3} />
                                            <button onClick={async () => {
                                                try {
                                                    await updateProject(project._id, { description: descriptionInput });
                                                    setProject(prev => ({ ...prev, description: descriptionInput }));
                                                    toastSuccess("Description updated");
                                                } catch { toastError("Failed update"); }
                                            }} className="self-end px-3 py-1 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-900">Save</button>
                                        </div>
                                    ) : <p className="text-sm text-slate-700">{project.description || "No description provided."}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Start Date</p>
                                        <p className="text-sm font-medium text-slate-800">{new Date(project.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">End Date</p>
                                        {canEditProject ? (
                                            <input type="date" value={endDateInput} onChange={async (e) => {
                                                setEndDateInput(e.target.value);
                                                try {
                                                    const updated = await updateProject(project._id, { endDate: e.target.value });
                                                    setProject(prev => ({ ...prev, endDate: updated.endDate }));
                                                    toastSuccess("Date updated");
                                                } catch { toastError("Failed"); }
                                            }} className="border border-slate-300 rounded px-2 py-1 text-sm w-full" />
                                        ) : <p className="text-sm font-medium text-slate-800">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "Ongoing"}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Team Leader Card */}
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
                                <div className="text-center">
                                    <p className="text-sm text-slate-400 italic mb-3">No leader assigned.</p>
                                    {canEditProject && (
                                         <select
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={(e) => { if(e.target.value) handleTeamLeaderChange(e.target.value); }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Assign Leader...</option>
                                            {employees.filter(e => e.role === "Employee" && !e.teamLeader).map((emp) => (
                                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Team Management */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h2 className="font-bold text-slate-800">Team Members</h2>
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                    {project.employees?.length || 0} / {project.slotCount || "∞"}
                                </span>
                            </div>
                            {canEditProject && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Capacity:</span>
                                    <input type="number" min="1" value={slotCountInput} onChange={(e) => setSlotCountInput(e.target.value)} className="w-12 text-xs border border-slate-300 rounded px-1 py-0.5" />
                                    <button onClick={async () => {
                                        try {
                                            const updated = await updateProject(project._id, { slotCount: Number(slotCountInput) });
                                            setProject(prev => ({ ...prev, slotCount: updated.slotCount }));
                                            toastSuccess("Updated");
                                        } catch { toastError("Failed"); }
                                    }} className="text-xs text-blue-600 hover:underline">Set</button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            {project.employees?.length > 0 ? (
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
                                                                    setProject((prev) => ({ ...prev, employees: prev.employees.filter((e) => e._id !== emp._id) }));
                                                                    toastSuccess("Removed");
                                                                } catch { toastError("Failed"); }
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
                            ) : <div className="p-8 text-center text-slate-400 text-sm">No team members assigned yet.</div>}
                        </div>

                        {canManageTeam && !project.teamLocked && !isCompleted && (
                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Add Members</h3>
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
                                                            setSelectedEmployees((prev) => checked ? [...prev, emp._id] : prev.filter((id) => id !== emp._id));
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
                                            Add Selected ({selectedEmployees.length})
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500 italic bg-white p-3 rounded border border-dashed border-slate-300">
                                        No available employees (Check workload limits or team assignment).
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

export default ProjectDetails;