import api from "../api/interceptors";

// Attendance summary
export const getAttendanceReport = async (date) => {
    const res = await api.get("/admin/reports/attendance", {
        params: { date },
    });
    return res.data;
};

// Payroll summary
export const getPayrollReport = async (month) => {
    const res = await api.get("/admin/reports/payroll", {
        params: { month },
    });
    return res.data;
};
