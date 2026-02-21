const mongoose = require("mongoose");

const requestDemoSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        purpose: {
            type: String,
            required: true,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("RequestDemo", requestDemoSchema, "requestDemo");
