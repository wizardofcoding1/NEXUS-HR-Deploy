const mongoose = require("mongoose");

const auditAlertRuleSchema = new mongoose.Schema(
    {
        failedLoginThreshold: { type: Number, default: 5 },
        windowMinutes: { type: Number, default: 60 },
        enabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditAlertRule", auditAlertRuleSchema);
