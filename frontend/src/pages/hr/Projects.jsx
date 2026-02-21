import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { assignEmployeesToProject, getAllProjects, unassignEmployeesFromProject } from "../../services/projectService";
import { getAllEmployees } from "../../services/employeeService";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import TableSkeleton from "../../components/ui/TableSkeleton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { toastError, toastSuccess } from "../../utils/toast";
import { getSocket } from "../../services/socket";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await getAllProjects();
            setProjects(Array.isArray(res) ? res : []);
        } catch {
            toastError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await getAllEmployees();
            setEmployees(Array.isArray(res) ? res : []);
        } catch {
            setEmployees([]);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchEmployees();
        const socket = getSocket();
        if (!socket) return;
        const refresh = () => fetchProjects();
        socket.on("project:assigned", refresh);
        socket.on("project:unassigned", refresh);
        return () => {
            socket.off("project:assigned", refresh);
            socket.off("project:unassigned", refresh);
        };
    }, []);

    const assignEmployee = async (projectId, employeeId) => {
        try {
            await assignEmployeesToProject(projectId, [employeeId]);
            toastSuccess("Employee assigned");
            fetchProjects();
        } catch (err) {
            toastError(err.response?.data?.message || "Assign failed");
        }
    };

    const confirmUnassign = (projectId, employeeId) => {
        setSelected({ projectId, employeeId });
        setOpen(true);
    };

    const unassignEmployee = async () => {
        try {
            await unassignEmployeesFromProject(selected.projectId, [selected.employeeId]);
            toastSuccess("Employee unassigned");
            setOpen(false);
            setSelected(null);
            fetchProjects();
        } catch {
            toastError("Unassign failed");
        }
    };

    const getEndLabel = (proj) => {
        if (proj.endDate) return new Date(proj.endDate).toLocaleDateString();
        return new Date(proj.startDate) > new Date() ? "Scheduled" : "Ongoing";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-green-100 text-green-700 border-green-200";
            case "Ongoing": return "bg-blue-100 text-blue-700 border-blue-200";
            case "On Hold": return "bg-amber-100 text-amber-700 border-amber-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <MainLayout>
            <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
                
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Project Management</h1>
                        <p className="text-sm text-slate-500 mt-1">Oversee project timelines, teams, and assignments.</p>
                    </div>
                    <Link to="/hr/projects/create">
                        <Button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
                            <span className="text-lg leading-none font-light">+</span> New Project
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading && <div className="p-8"><TableSkeleton rows={5} /></div>}
                        
                        {!loading && projects.length === 0 && (
                            <div className="p-12 text-center text-slate-500">
                                <p>No projects found.</p>
                            </div>
                        )}

                        {!loading && projects.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 w-64">Project</th>
                                        <th className="px-6 py-4 w-40">Client</th>
                                        <th className="px-6 py-4 w-32">Status</th>
                                        <th className="px-6 py-4 w-48">Team Leader</th>
                                        <th className="px-6 py-4 w-24">Capacity</th>
                                        <th className="px-6 py-4">Timeline</th>
                                        <th className="px-6 py-4 w-20 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projects.map((proj) => (
                                        <tr key={proj._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{proj.projectName}</span>
                                                    {proj.teamLocked && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit mt-1 border border-amber-100">
                                                            <Icon name="Lock" size={10} /> LOCKED
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">{proj.client}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(proj.status)}`}>
                                                    {proj.status || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {proj.teamLeader?.name ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {proj.teamLeader.name.charAt(0)}
                                                        </div>
                                                        <span>{proj.teamLeader.name}</span>
                                                    </div>
                                                ) : <span className="text-slate-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <span className="font-medium text-slate-900">{proj.employees?.length || 0}</span>
                                                <span className="text-slate-400 text-xs"> / {proj.slotCount || "∞"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>Start: {new Date(proj.startDate).toLocaleDateString()}</span>
                                                    <span>End: {getEndLabel(proj)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/hr/projects/${proj._id}`}
                                                    className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <ConfirmModal
                    open={open}
                    title="Remove Team Member"
                    message="Are you sure you want to remove this employee from the project?"
                    onCancel={() => setOpen(false)}
                    onConfirm={unassignEmployee}
                />
            </div>
        </MainLayout>
    );
};

export default Projects;