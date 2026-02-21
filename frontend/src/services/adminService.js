import api from "../api/interceptors";

// Get all HRs
export const getHRs = async ({ status = "", department = "", shift = "" } = {}) => {
    const res = await api.get("/admin/hrs", {
        params: { status, department, shift },
    });
    return res.data;
};

// Create HR
export const createHR = async (data) => {
    const res = await api.post("/admin/hrs", data);
    return res.data;
};

// Activate / Deactivate HR
export const toggleHRStatus = async (id) => {
    const res = await api.patch(`/admin/hrs/${id}/toggle-status`);
    return res.data;
};

// Demo Requests
export const getDemoRequests = async ({ page = 1, limit = 20, search = "" } = {}) => {
    const res = await api.get("/admin/demo-requests", {
        params: { page, limit, search },
    });
    return res.data;
};
