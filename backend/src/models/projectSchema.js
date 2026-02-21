const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        projectId: {
            type: String,
            required: true,
            unique: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        projectName: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        client: {
            type: String,
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        createdByRole: {
            type: String,
            enum: ["Admin", "HR"],
            required: true,
        },

        teamLeader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: false,
        },

        employees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee",
            },
        ],

        slotCount: {
            type: Number,
            default: 2,
            min: 1,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            reqyuored: false
        },

        status: {
            type: String,
            enum: ["Scheduled", "Ongoing", "Completed", "On Hold"],
            default: "Scheduled",
        },

        teamLocked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
