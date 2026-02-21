import api from "../api/interceptors";

// get all projects (HR)
export const getAllProjects = async () => {
    const res = await api.get("/projects");
    return res.data.data;
};

// assign employees to project
export const assignEmployeesToProject = async (projectId, employeeIds) => {
    const res = await api.patch(
        `/projects/${projectId}/assign-employees`,
        { employeeIds }
    );
    return res.data.data;
};

// get single project details
export const getProjectById = async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
};

// unassign employees from project
export const unassignEmployeesFromProject = async (projectId, employeeIds) => {
    const res = await api.patch(
        `/projects/${projectId}/unassign-employees`,
        { employeeIds }
    );
    return res.data.data;
};

// employee / team leader dashboard projects
export const getMyDashboardProjects = async () => {
    const res = await api.get("/projects/my-dashboard");
    return res.data.data;
};

// create project (HR)
export const createProject = async (data) => {
    const res = await api.post("/projects", data);
    return res.data.data;
};

// update project (HR / TeamLeader)
export const updateProject = async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.data;
};

