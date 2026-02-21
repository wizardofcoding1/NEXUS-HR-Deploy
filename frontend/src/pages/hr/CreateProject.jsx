import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { createProject } from "../../services/projectService";
import { getAllEmployees } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";

const CreateProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null);
    const today = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        projectName: "",
        client: "",
        startDate: "",
        endDate: "",
        description: "",
        teamLeader: "",
    });

    const [teamLeaders, setTeamLeaders] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const list = await getAllEmployees();
                const eligible = Array.isArray(list)
                    ? list.filter((emp) => emp.role === "Employee" && !emp.teamLeader)
                    : [];
                setTeamLeaders(eligible);
            } catch {
                toastError("Failed to load employees");
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.teamLeader) {
                toastError("Please select a Team Leader");
                setLoading(false);
                return;
            }
            const created = await createProject(formData);
            setCreated(created);
            toastSuccess("Project created successfully");
            if (created?._id) {
                navigate(`/hr/projects/${created._id}`);
            }
        } catch {
            toastError("Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            {loading && <LoadingOverlay label="Creating project..." />}
            <div className="max-w-3xl mx-auto pb-10">
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => navigate("/hr/projects")}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                        <span>&larr;</span> Projects
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-medium text-slate-800">Create New</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h1 className="text-xl font-bold text-slate-800">Project Details</h1>
                        <p className="text-sm text-slate-500 mt-1">Define the scope and leadership for the new project.</p>
                    </div>

                    <div className="p-6">
                        {created && (
                            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex flex-col gap-1 text-sm">
                                <p className="font-bold flex items-center gap-2">
                                    <span className="w-5 h-5 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs">✓</span>
                                    Project Created Successfully
                                </p>
                                <p>ID: <span className="font-mono">{created.projectId}</span></p>
                                <p>Name: {created.projectName}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Project Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="projectName"
                                            required
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            className="w-full border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border transition-all placeholder:text-slate-400"
                                            placeholder="e.g. Q3 Marketing Campaign"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Client Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="client"
                                            required
                                            value={formData.client}
                                            onChange={handleChange}
                                            className="w-full border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
                                            placeholder="Client Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Team Leader <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="teamLeader"
                                            required
                                            value={formData.teamLeader}
                                            onChange={handleChange}
                                            className="w-full border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border bg-white transition-all"
                                        >
                                            <option value="">Select a Leader...</option>
                                            {teamLeaders.map((emp) => (
                                                <option key={emp._id} value={emp._id}>
                                                    {emp.name} ({emp.employeeId})
                                                </option>
                                            ))}
                                        </select>
                                        {teamLeaders.length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1">No eligible employees found.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            required
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            min={today}
                                            className="w-full border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border text-slate-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate || today}
                                            className="w-full border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border text-slate-600"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none border resize-none placeholder:text-slate-400"
                                            placeholder="Brief overview of project goals..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                    onClick={() => navigate("/hr/projects")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Create Project
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CreateProject;