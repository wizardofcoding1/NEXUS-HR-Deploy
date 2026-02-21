const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const employeeSchema = new mongoose.Schema(
    {
        compnayId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        employeeId: {
            type: String,
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: function () {
                return this.role !== "Admin";
            },
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },
        personalEmail: {
            type: String,
            required: false,
        },

        // auth password
        password: {
            type: String,
            required: false,
            select: false,
        },

        forgotPasswordToken: String,
        forgotPasswordExpires: Date,

        loginAttempts: {
            type: Number,
            default: 0,
        },

        lockUntil: {
            type: Date,
        },

        isActivated: {
            type: Boolean,
            default: false,
        },

        phone: {
            type: String,
            required: function () {
                return this.role !== "Admin";
            },
        },

        role: {
            type: String,
            enum: ["Admin", "HR", "Employee", "TeamLeader"],
            default: "Employee",
        },
        teamLeader: {
            type: Boolean,
            default: false,
        },

        department: {
            type: String,
            required: function () {
                return this.role !== "Admin";
            },
        },

        position: {
            type: String,
            required: function () {
                return this.role !== "Admin";
            },
        },

        shift: {
            type: String,
            enum: ["Morning", "Evening", "Night"],
            default: "Morning",
        },

        shiftType: {
            type: String,
            enum: ["Fixed", "Flexible"],
            default: "Fixed",
        },

        dateOfJoining: {
            type: Date,
            required: function () {
                return this.role !== "Admin";
            },
        },

        employmentStatus: {
            type: String,
            enum: ["Active", "On Leave", "Resigned"],
            default: "Active",
        },

        // reporting TL (only for Employee role)
        reportsTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
        },

        // current projects
        projectWorking: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
            },
        ],
        // completed projects
        projectHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
            },
        ],
        // team leader assignment history
        teamLeaderHistory: [
            {
                project: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Project",
                    required: true,
                },
                assignedAt: {
                    type: Date,
                    default: Date.now,
                },
                releasedAt: {
                    type: Date,
                },
            },
        ],

        maxActiveProjects: {
            type: Number,
            default: 2,
            min: 1,
        },

        aadharNumber: {
            type: String,
            default: undefined,
        },

        panNumber: {
            type: String,
            default: undefined,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        passwordChangedAt: Date,
        salary: {
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            allowances: { type: Number, default: 0 },
            overtimeRate: { type: Number, default: 0 },
            paidLeaveDeduction: { type: Number, default: 0 },
            halfDayDeduction: { type: Number, default: 0 },
            travelAllowance: { type: Number, default: 300 },
            deductions: {
                pf: { type: Number, default: 0 },
                tax: { type: Number, default: 0 },
            },
        },
    },
    { timestamps: true }
);

// check account lock
employeeSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

// generate password reset token
employeeSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.forgotPasswordExpires = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

// hash password before save
employeeSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    if (!this.password) return;

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now();
});

// compare password during login
employeeSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);

0
