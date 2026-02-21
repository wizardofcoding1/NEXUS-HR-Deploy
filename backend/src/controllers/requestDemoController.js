const RequestDemo = require("../models/requestDemoModel");

exports.createRequestDemo = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            purpose,
            company,
        } = req.body;

        if (!fullName || !email || !phone || !purpose) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing.",
            });
        }

        const requestDemo = await RequestDemo.create({
            fullName,
            email,
            phone,
            purpose,
            company,
        });

        return res.status(201).json({
            success: true,
            data: requestDemo,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit demo request.",
        });
    }
};
