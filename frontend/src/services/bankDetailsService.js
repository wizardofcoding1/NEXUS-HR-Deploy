import api from "../api/interceptors";

// Employee: get my bank details
export const getMyBankDetails = async () => {
    const res = await api.get("/bank-details/me");
    return res.data?.data;
};

// HR/Admin: get bank details by employee id
export const getBankDetailsByEmployee = async (employeeId) => {
    const res = await api.get(`/bank-details/${employeeId}`);
    return res.data?.data;
};

// Employee: add or update my bank details
export const upsertMyBankDetails = async (data) => {
    const res = await api.post("/bank-details", data);
    return res.data?.data;
};

// HR: Get all bank details (masked)
export const getAllBankDetails = async () => {
    const res = await api.get("/bank-details");
    return res.data?.data || [];
};
