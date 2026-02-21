const mongoose = require("mongoose");

const loginAuditSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        email: String,
        role: String,
        ipAddress: String,
        userAgent: String,
        status: {
            type: String,
            enum: ["SUCCESS", "FAILED"],
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("LoginAudit", loginAuditSchema);
