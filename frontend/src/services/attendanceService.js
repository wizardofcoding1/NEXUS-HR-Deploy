import api from "../api/interceptors";

export const markAttendance = async () => {
    const res = await api.post("/attendance");
    return res.data;
};

export const getMyAttendance = async ({ date, month } = {}) => {
    const params = {};
    if (date) params.date = date;
    if (month) params.month = month;
    const res = await api.get("/attendance/me", { params });
    return res.data?.data || [];
};

export const getAttendanceByEmployee = async (employeeId, { date, month } = {}) => {
    const params = {};
    if (date) params.date = date;
    if (month) params.month = month;
    const res = await api.get(`/attendance/employee/${employeeId}`, { params });
    return res.data?.data || [];
};

export const getAllAttendance = async ({ date, month } = {}) => {
    const params = {};
    if (date) params.date = date;
    if (month) params.month = month;
    const res = await api.get("/attendance", { params });
    return res.data?.data || [];
};

export const getAttendancePolicy = async () => {
    const res = await api.get("/attendance/policy");
    return res.data;
};

export const updateAttendancePolicy = async (data) => {
    const res = await api.put("/attendance/policy", data);
    return res.data;
};
