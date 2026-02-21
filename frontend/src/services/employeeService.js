import api from "../api/interceptors";

// =========================
// GET ALL EMPLOYEES (HR / ADMIN)
// =========================
export const getAllEmployees = async () => {
    const res = await api.get("/employees");

    // Backend returns:
    // { success, message, data, count }
    return res.data.data;
};

// create employee (HR)
export const createEmployee = async (data) => {
    const res = await api.post("/employees/create", data);
    return res.data.data;
};

// =========================
// GET SINGLE EMPLOYEE PROFILE
// =========================
export const getEmployeeById = async (id) => {
    const res = await api.get(`/employees/${id}`);
    return res.data.data;
};

// get my full profile (all roles)
export const getMyEmployeeProfile = async () => {
    const res = await api.get("/employees/me");
    return res.data.data;
};

// =========================
// ACTIVATE / DEACTIVATE EMPLOYEE
// =========================
export const toggleEmployeeStatus = async (id, isActive) => {
    const res = await api.put(`/employees/${id}`, {
        isActive,
    });
    return res.data.data;
};

// delete employee (Admin/HR)
export const deleteEmployee = async (id) => {
    const res = await api.delete(`/employees/${id}/remove`);
    return res.data.data;
};

// get all team leaders (HR use)
export const getTeamLeaders = async () => {
    const res = await api.get("/employees?teamLeader=true");
    return res.data.data;
};

// assign team leader to employee
export const assignTeamLeader = async (employeeId, teamLeaderId) => {
    const res = await api.patch(
        `/employees/${employeeId}/assign-tl`,
        { teamLeaderId }
    );
    return res.data.data;
};

// update employee (Admin/HR)
export const updateEmployee = async (id, data) => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data.data;
};

// employees available for project assignment (HR)
export const getEmployeesForAssignment = async () => {
    const res = await api.get("/employees");
    return res.data.data;
};
