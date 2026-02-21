import api from "../api/interceptors";

// HR: get payrolls (optionally by month)
export const getPayrolls = async (month) => {
    const res = await api.get("/payrolls", {
        params: month ? { month } : {},
    });
    return res.data?.data || [];
};

// HR/Admin: create payroll payment
export const createPayrollPayment = async (employeeId, payType) => {
    const res = await api.post("/payrolls/pay", { employeeId, payType });
    return res.data?.data;
};

// HR: mark payroll as paid
export const markPayrollPaid = async (id) => {
    const res = await api.patch(`/payrolls/${id}/pay`);
    return res.data?.data;
};

// Employee: get own payrolls
export const getMyPayrolls = async () => {
    const res = await api.get("/payrolls/me");
    return res.data?.data || [];
};
