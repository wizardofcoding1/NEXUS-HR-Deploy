import api from "../api/axios";

export const createRequestDemo = async (data) => {
    const res = await api.post("/request-demo", data);
    return res.data;
};
