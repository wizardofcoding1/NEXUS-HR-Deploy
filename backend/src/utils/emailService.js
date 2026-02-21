const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, //TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: `"HRMS Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    try {
        await transporter.verify();
    } catch (error) {
        console.error("Email transporter verify failed:", error?.message || error);
        throw error;
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Send email failed:", error?.message || error);
        throw error;
    }
};

module.exports = sendEmail;
