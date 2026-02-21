const sgMail = require("@sendgrid/mail");

const sendEmail = async ({ to, subject, html, text, from }) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        throw new Error("SENDGRID_API_KEY is not set");
    }

    sgMail.setApiKey(apiKey);

    const defaultFrom =
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER ||
        "HRMS Support <no-reply@noreply.local>";

    const msg = {
        to,
        from: from || defaultFrom,
        subject,
        html,
        text,
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error("Send email failed:", error?.message || error);
        if (error?.response?.body) {
            console.error("SendGrid error body:", error.response.body);
        }
        throw error;
    }
};

module.exports = sendEmail;
