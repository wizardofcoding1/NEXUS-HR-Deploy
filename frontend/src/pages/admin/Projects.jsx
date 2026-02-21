import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAllProjects } from "../../services/projectService";
import Icon from "../../components/ui/Icon";
import TableSkeleton from "../../components/ui/TableSkeleton";
import { toastError } from "../../utils/toast";
import { getSocket } from "../../services/socket";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchProjects();
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
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
                        <p className="text-sm text-slate-500 mt-1">Track and manage client projects</p>
                    </div>
                    <Link to="/admin/projects/create">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Icon name="Plus" size={18} />
                            New Project
                        </button>
                    </Link>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading && (
                            <div className="p-6">
                                <TableSkeleton rows={5} />
                            </div>
                        )}

                        {!loading && projects.length === 0 && (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Icon name="Folder" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-slate-800">No Projects Found</h3>
                                <p className="text-slate-500 mt-1 mb-4">Get started by creating a new project assignment.</p>
                                <Link to="/admin/projects/create" className="text-blue-600 font-medium hover:underline">Create Project</Link>
                            </div>
                        )}

                        {!loading && projects.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Project Name</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Team Leader</th>
                                        <th className="px-6 py-4">Team</th>
                                        <th className="px-6 py-4">Timeline</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projects.map((proj) => (
                                        <tr key={proj._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 text-base">{proj.projectName}</span>
                                                    {proj.teamLocked && (
                                                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 mt-1">
                                                            <Icon name="Lock" size={10} /> Locked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">{proj.client}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(proj.status)}`}>
                                                    {proj.status || "Scheduled"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {proj.teamLeader ? proj.teamLeader.name : <span className="text-slate-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-slate-700">{proj.employees?.length || 0}</span>
                                                    <span className="text-slate-400 text-xs">/ {proj.slotCount || "∞"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>Start: {new Date(proj.startDate).toLocaleDateString()}</span>
                                                    <span>End: {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "Ongoing"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    to={`/admin/projects/${proj._id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all text-xs font-medium shadow-sm"
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
            </div>
        </MainLayout>
    );
};

export default Projects;