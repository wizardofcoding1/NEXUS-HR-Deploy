
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const sendEmail = async ({ to, subject, html }) => {
    const apiKey = process.env.MAILERSEND_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Missing MailerSend API key. Set MAILERSEND_API_KEY (or API_KEY).");
    }

    const mailerSend = new MailerSend({ apiKey });

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!fromEmail) {
        throw new Error("Missing sender email. Set EMAIL_FROM (or EMAIL_USER).");
    }

    const fromName = process.env.EMAIL_FROM_NAME || "HRMS Support";
    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(html);

    await mailerSend.email.send(emailParams);
};

module.exports = sendEmail;
