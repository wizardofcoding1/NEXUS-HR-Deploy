import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getMyEmployeeProfile } from "../../services/employeeService";
import { getMyDashboardProjects } from "../../services/projectService";
import { useAuthStore } from "../../store/authStore";

const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-";

const ProjectTable = ({ projects, emptyText, showManage }) => {
    if (!projects.length) {
        return <div className="p-8 text-center text-slate-500 italic text-sm">{emptyText}</div>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-3">Project Name</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Timeline</th>
                        <th className="px-6 py-3">Team Leader</th>
                        {showManage && <th className="px-6 py-3 text-right">Action</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {projects.map((project) => (
                        <tr key={project._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">{project.projectName || project.projectId || "-"}</span>
                                    <span className="text-xs text-slate-400">{project.projectId}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{project.client || "-"}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium 
                                    ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                      project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 
                                      'bg-slate-100 text-slate-700'}`}>
                                    {project.status || "Unknown"}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                                <div>Start: {formatDate(project.startDate)}</div>
                                <div>End: {formatDate(project.endDate)}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {project.teamLeader?.name ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                            {project.teamLeader.name.charAt(0)}
                                        </div>
                                        <span>{project.teamLeader.name}</span>
                                    </div>
                                ) : "-"}
                            </td>
                            {showManage && (
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        to={`/employee/projects/${project._id}`}
                                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                    >
                                        {project.status === "Completed" ? "View" : "Manage"}
                                    </Link>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EmployeeProjects = () => {
    const { user, setUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const [profileData, dashboardProjects] = await Promise.all([
                getMyEmployeeProfile(),
                getMyDashboardProjects().catch(() => []),
            ]);
            
            const merged = {
                ...profileData,
                dashboardProjects: Array.isArray(dashboardProjects) ? dashboardProjects : [],
            };

            if (profileData && user && (profileData.teamLeader !== user.teamLeader || profileData.role !== user.role)) {
                setUser({
                    ...user,
                    teamLeader: profileData.teamLeader,
                    role: profileData.role || user.role,
                });
            }
            setProfile(merged);
        } catch {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const allProjects = useMemo(() => {
        if (!profile) return [];
        const combined = [
            ...(profile.projectWorking || []),
            ...(profile.projectHistory || []),
            ...(profile.dashboardProjects || [])
        ];
        // Filter unique projects by _id
        return combined.filter((proj, index, self) => 
            self.findIndex(p => p._id === proj._id) === index
        );
    }, [profile]);

    const isLead = (project) => {
        const leaderId = project?.teamLeader?._id || project?.teamLeader;
        const myId = profile?._id || user?._id;
        return String(leaderId || "") === String(myId || "");
    };

    const leadCurrent = useMemo(() => allProjects.filter((p) => isLead(p) && p.status !== "Completed"), [allProjects, profile, user]);
    const leadHistory = useMemo(() => allProjects.filter((p) => isLead(p) && p.status === "Completed"), [allProjects, profile, user]);
    const memberCurrent = useMemo(() => allProjects.filter((p) => !isLead(p) && p.status !== "Completed"), [allProjects, profile, user]);
    const memberHistory = useMemo(() => allProjects.filter((p) => !isLead(p) && p.status === "Completed"), [allProjects, profile, user]);

    if (loading) return <MainLayout><div className="p-12 text-center animate-pulse text-slate-500">Loading projects...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto pb-10 space-y-8">
                
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-800">My Projects</h1>
                    {profile?.teamLeader && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                            Team Leader Access
                        </span>
                    )}
                </div>

                {!profile ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center text-slate-500">
                        Unable to load project data.
                    </div>
                ) : (
                    <div className="space-y-8">
                        
                        {/* CURRENTLY LEADING */}
                        {leadCurrent.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
                                    <h2 className="font-bold text-indigo-900">Projects I'm Leading</h2>
                                </div>
                                <ProjectTable projects={leadCurrent} showManage />
                            </div>
                        )}

                        {/* CURRENT MEMBER */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">Active Projects (Member)</h2>
                            </div>
                            <ProjectTable projects={memberCurrent} emptyText="No active projects assigned as a team member." />
                        </div>

                        {/* HISTORY SECTION */}
                        {(leadHistory.length > 0 || memberHistory.length > 0) && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-700 ml-1">Project History</h3>
                                
                                {leadHistory.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
                                            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Completed as Leader</h4>
                                        </div>
                                        <ProjectTable projects={leadHistory} showManage />
                                    </div>
                                )}

                                {memberHistory.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
                                            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Completed as Member</h4>
                                        </div>
                                        <ProjectTable projects={memberHistory} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default EmployeeProjects;