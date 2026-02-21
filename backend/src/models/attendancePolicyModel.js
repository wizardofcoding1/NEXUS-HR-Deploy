const mongoose = require("mongoose");

const shiftRuleSchema = new mongoose.Schema(
    {
        start: { type: String, required: true }, // "HH:MM"
        end: { type: String, required: true }, // "HH:MM"
        breakMinutes: { type: Number, default: 60 },
        breakPaid: { type: Boolean, default: false },
        graceMinutes: { type: Number, default: 10 },
    },
    { _id: false }
);

const flexibleShiftSchema = new mongoose.Schema(
    {
        requiredHours: { type: Number, default: 9 },
        graceMinutes: { type: Number, default: 15 },
    },
    { _id: false }
);

const overtimeSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: true },
        startAfterMinutes: { type: Number, default: 30 },
        rateMultiplier: { type: Number, default: 1.5 },
    },
    { _id: false }
);

const lateRuleSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: true },
        lateToHalfDayCount: { type: Number, default: 3 },
    },
    { _id: false }
);

const earlyOutRuleSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: true },
        deductByMinutes: { type: Boolean, default: true },
    },
    { _id: false }
);

const attendancePolicySchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        shiftType: {
            type: String,
            enum: ["Fixed", "Flexible"],
            default: "Fixed",
        },
        shiftRules: {
            Morning: { type: shiftRuleSchema, required: true },
            Evening: { type: shiftRuleSchema, required: true },
            Night: { type: shiftRuleSchema, required: true },
        },
        flexibleShift: { type: flexibleShiftSchema, required: true },
        overtime: { type: overtimeSchema, required: true },
        lateRule: { type: lateRuleSchema, required: true },
        earlyOutRule: { type: earlyOutRuleSchema, required: true },
        minHalfDayHours: { type: Number, default: 4 },
        minFullDayHours: { type: Number, default: 8 },
        absentAutoMarkTime: { type: String, default: "12:00" },
        consecutiveAbsentThreshold: { type: Number, default: 3 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AttendancePolicy", attendancePolicySchema);
