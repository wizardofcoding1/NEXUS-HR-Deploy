import api from "../api/interceptors";

// Employee: get own salary records
export const getMySalary = async () => {
    const res = await api.get("/salaries/me");
    return res.data.data;
};
