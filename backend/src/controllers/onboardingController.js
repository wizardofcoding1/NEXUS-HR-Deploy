const Employee = require("../models/employeeModel");
const Company = require("../models/companyModel");
const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");
const { getNextEmployeeId } = require("../utils/idGenerator");
const sendEmail = require("../utils/emailService");

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const buildSlug = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const parseDomain = (email) => {
    const atIndex = String(email || "").lastIndexOf("@");
    if (atIndex === -1) return "";
    return String(email || "").slice(atIndex + 1).toLowerCase().trim();
};

exports.getStarted = async (req, res) => {
    try {
        const personalEmail = normalizeEmail(req.body.personalEmail);
        const companyName = String(req.body.companyName || "").trim();
        const companyEmail = normalizeEmail(req.body.companyEmail);

        if (!personalEmail || !companyName || !companyEmail) {
            return sendError(res, "All fields are required", 400);
        }

        if (!companyEmail.includes("@") || !personalEmail.includes("@")) {
            return sendError(res, "Invalid email format", 400);
        }

        const slug = buildSlug(companyName);
        if (!slug) {
            return sendError(res, "Invalid company name", 400);
        }

        const domain = parseDomain(companyEmail);
        if (!domain) {
            return sendError(res, "Invalid company email domain", 400);
        }

        const existingCompany = await Company.findOne({
            $or: [{ slug }, { domain }],
        });
        if (existingCompany) {
            return sendError(
                res,
                "Company already exists with this name or domain",
                409,
            );
        }

        const existingUser = await Employee.findOne({
            $or: [{ email: companyEmail }, { personalEmail }],
        });
        if (existingUser) {
            return sendError(
                res,
                "An account already exists with this email",
                409,
            );
        }

        const company = await Company.create({
            name: companyName,
            slug,
            domain,
            adminEmail: companyEmail,
            contactEmail: personalEmail,
        });

        const employeeId = await getNextEmployeeId("Admin");

        const admin = await Employee.create({
            compnayId: company._id,
            employeeId,
            email: companyEmail,
            personalEmail,
            role: "Admin",
            isActive: true,
            isActivated: false,
        });

        let emailError = null;
        try {
            const frontendBaseUrl =
                process.env.FRONTEND_URL || "http://localhost:5173";
            const activationLink = `${frontendBaseUrl}/activate?email=${encodeURIComponent(companyEmail)}`;
            const sendPasswordEmails =
                String(process.env.SEND_PASSWORD_EMAILS || "true") !== "false";
            if (sendPasswordEmails) {
                await sendEmail({
                    to: personalEmail,
                    subject: "Activate your admin account",
                    html: `
                        <p>Hello,</p>
                        <p>Your company workspace has been created.</p>
                        <p><b>Company Email:</b> ${companyEmail}</p>
                        <p>Please activate your admin account using the link below:</p>
                        <p><a href="${activationLink}">${activationLink}</a></p>
                    `,
                });
            } else {
                emailError = "Activation emails are disabled by configuration.";
            }
        } catch (error) {
            emailError = error.message;
        }

        sendResponse(
            res,
            "Company and admin created",
            {
                companyId: company._id,
                adminId: admin._id,
                adminEmail: admin.email,
                activationRequired: true,
                emailError,
            },
            null,
            201,
        );
    } catch (error) {
        sendError(res, error.message);
    }
};
