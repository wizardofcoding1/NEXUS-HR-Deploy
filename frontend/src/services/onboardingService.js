import api from "../api/interceptors";

export const submitGetStarted = async (payload) => {
    const res = await api.post("/onboarding/get-started", payload);
    return res.data?.data;
};
