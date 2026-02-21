import api from "../api/interceptors";

export const getAuditLogs = async ({
    page = 1,
    limit = 10,
    status = "",
    role = "",
    entity = "",
    action = "",
    fromDate,
    toDate,
}) => {
    const res = await api.get("/admin/audit-logs", {
        params: { page, limit, status, role, entity, action, fromDate, toDate },
    });
    return res.data;
};

export const getAuditSummary = async ({ fromDate, toDate } = {}) => {
    const res = await api.get("/admin/audit-logs/summary", {
        params: { fromDate, toDate },
    });
    return res.data;
};

export const getAuditAlertRule = async () => {
    const res = await api.get("/admin/audit-logs/alert-rule");
    return res.data;
};

export const updateAuditAlertRule = async (data) => {
    const res = await api.put("/admin/audit-logs/alert-rule", data);
    return res.data;
};
