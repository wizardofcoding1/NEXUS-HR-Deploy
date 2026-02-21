const axios = require("axios");

const parseFrom = (value) => {
    const fallback = {
        email: "support@test-yxj6lj9qn2x4do2r.mlsender.net",
        name: "HRMS Support",
    };

    if (!value) return fallback;

    const match = String(value).match(/^\s*"?([^"]+?)"?\s*<([^>]+)>\s*$/);

    if (match) {
        return {
            name: match[1].trim(),
            email: match[2].trim(),
        };
    }

    return {
        email: String(value).trim(),
        name: fallback.name,
    };
};

const sendEmail = async ({ to, subject, html, text, from }) => {
    const apiKey = process.env.MAILERSEND_API_KEY;

    if (!apiKey) {
        throw new Error("MAILERSEND_API_KEY is not set in .env");
    }

    const defaultFrom =
        process.env.EMAIL_FROM ||
        "HRMS Support <support@test-yxj6lj9qn2x4do2r.mlsender.net>";

    const sender = parseFrom(from || defaultFrom);

    const recipients = Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }];

    const payload = {
        from: sender,
        to: recipients,
        subject,
        html,
        text,
    };

    try {
        const response = await axios.post(
            "https://api.mailersend.com/v1/email",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000,
            }
        );

        console.log("✅ Email sent successfully:", response.data);
        return true;

    } catch (error) {
        console.error("❌ Email sending failed");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }

        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;