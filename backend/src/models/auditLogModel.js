const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        userName: String,
        userEmail: String,
        role: String,
        action: { type: String, required: true },
        entity: { type: String, required: true },
        entityId: String,
        status: { type: String, enum: ["SUCCESS", "FAILED"], default: "SUCCESS" },
        message: String,
        details: Object,
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
