import api from "../api/interceptors";

export const getDashboardStats = async () => {
    const res = await api.get("/dashboard/stats");
    return res.data;
};

export const getDashboardCharts = async () => {
    const res = await api.get("/dashboard/charts");
    return res.data;
};

export const getProjectTrends = async (months) => {
    const params = months?.length ? { months: months.join(",") } : {};
    const res = await api.get("/dashboard/project-trends", { params });
    return res.data;
};

export const getLeaveTrends = async (months) => {
    const params = months?.length ? { months: months.join(",") } : {};
    const res = await api.get("/dashboard/leave-trends", { params });
    return res.data;
};
