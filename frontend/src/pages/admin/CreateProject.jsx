import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { createProject } from "../../services/projectService";
import { getAllEmployees } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";
import useForm from "../../hooks/useForm";
import useAsync from "../../hooks/useAsync";

const CreateProject = () => {
    const navigate = useNavigate();
    const [created, setCreated] = useState(null);

    const { values: formData, setValues: setFormData, handleChange } = useForm({
        projectName: "",
        client: "",
        startDate: "",
        endDate: "",
        description: "",
        teamLeader: "",
        slotCount: "",
    });

    const [teamLeaders, setTeamLeaders] = useState([]);

    const teamLeadersLoader = useAsync(async () => {
        const list = await getAllEmployees();
        const eligible = Array.isArray(list)
            ? list.filter(
                  (emp) => emp.role === "Employee" && !emp.teamLeader
              )
            : [];
        setTeamLeaders(eligible);
    });

    const createLoader = useAsync(async (payload) => {
        const res = await createProject(payload);
        return res;
    });

    // Fetch employees for team leader dropdown
    useEffect(() => {
        teamLeadersLoader.run().catch(() => toastError("Failed to load employees"));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.teamLeader) {
                toastError("Please select a Team Leader");
                return;
            }
            const res = await createLoader.run(formData);
            setCreated(res);
            toastSuccess("Project created successfully");
            // Optional: Reset form or keep it to show success state
        } catch {
            toastError("Failed to create project");
        }
    };

    return (
        <MainLayout>
            {createLoader.loading && <LoadingOverlay label="Creating project..." />}
            
            <div className="max-w-3xl mx-auto pb-10">
                {/* Header Navigation */}
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
                    <button
                        onClick={() => navigate("/admin/projects")}
                        className="hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                        <span>&larr;</span> Projects
                    </button>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">Create New</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <h1 className="text-xl font-bold text-slate-800">New Project Details</h1>
                        <p className="text-sm text-slate-500 mt-1">Fill in the information below to kickstart a new project.</p>
                    </div>

                    <div className="p-8">
                        {created ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    ✓
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Project Created!</h3>
                                <p className="text-slate-500 mt-2 mb-6">
                                    <span className="font-medium text-slate-900">{created.projectName}</span> has been successfully added to the system.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => {
                                            setCreated(null);
                                            setFormData({
                                                projectName: "",
                                                client: "",
                                                startDate: "",
                                                endDate: "",
                                                description: "",
                                                teamLeader: "",
                                                slotCount: "",
                                            });
                                        }}
                                    >
                                        Create Another
                                    </Button>
                                    <Button onClick={() => navigate("/admin/projects")}>
                                        View Projects
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Core Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Information</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Project Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="projectName"
                                                required
                                                value={formData.projectName}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="e.g. Q1 Marketing Campaign"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Client Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="client"
                                                required
                                                value={formData.client}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="e.g. Acme Corp"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Slot Count (Max Members)
                                            </label>
                                            <input
                                                type="number"
                                                name="slotCount"
                                                min="1"
                                                value={formData.slotCount}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="e.g. 5"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Timeline & Staffing */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeline & Staffing</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Start Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                required
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-600"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Team Leader <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="teamLeader"
                                                    required
                                                    value={formData.teamLeader}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white"
                                                >
                                                    <option value="">Select a Team Leader...</option>
                                                    {teamLeaders.map((emp) => (
                                                        <option key={emp._id} value={emp._id}>
                                                            {emp.name} — {emp.employeeId}
                                                        </option>
                                                    ))}
                                                </select>
                                                {/* Custom Arrow Pointer */}
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500 text-xs">
                                                    ▼
                                                </div>
                                            </div>
                                            {teamLeaders.length === 0 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    No eligible employees found (Must be role 'Employee' and not already a TL).
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Description */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Additional Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-blue-500 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                                            placeholder="Briefly describe the project goals and requirements..."
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => navigate("/admin/projects")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" isLoading={createLoader.loading}>
                                        Create Project
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CreateProject;
