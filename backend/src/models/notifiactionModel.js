const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            enum: [
                "EMPLOYEE_CREATED",
                "HR_CREATED",
                "PROJECT_CREATED",
                "PROJECT_ASSIGNED",
                "PROJECT_UNASSIGNED",
                "TEAMLEADER_ASSIGNED",
                "LEAVE_APPROVED",
                "LEAVE_REJECTED",
            ],
            required: true,
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
