import api from "../api/interceptors";

export const loginApi = async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
};

export const changePasswordApi = async (data) => {
    const res = await api.post("/auth/change-password", data);
    return res.data;
};

export const updateMyProfileApi = async (data) => {
    const res = await api.put("/employees/me/update", data);
    return res.data;
};

export const getMeApi = async () => {
    const res = await api.get("/auth/me");
    return res.data;
};

export const activateAccountApi = async (data) => {
    const res = await api.post("/auth/activate", data);
    return res.data;
};

export const forgotPasswordApi = async (data) => {
    const res = await api.post("/auth/forgot-password", data);
    return res.data;
};

export const resetPasswordApi = async (token, data) => {
    const res = await api.post(`/auth/reset-password/${token}`, data);
    return res.data;
};

export const logoutApi = async () => {
    const res = await api.post("/auth/logout");
    return res.data;
};
