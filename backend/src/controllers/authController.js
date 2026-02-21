const Employee = require("../models/employeeModel");
const Company = require("../models/companyModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");
const sendEmail = require("../utils/emailService");
const LoginAudit = require("../models/loginAuditModel");
const { createAuditLog } = require("../utils/auditLogger");

class AuthController {
    // =========================
    // LOGIN (HR / EMPLOYEE / TL)
    // =========================
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendError(res, "Email and password are required", 400);
            }

            const employee = await Employee.findOne({ email }).select(
                "+password",
            );

            // ❌ User not found
            if (!employee) {
                await LoginAudit.create({
                    email,
                    status: "FAILED",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                });
                await createAuditLog({
                    req,
                    action: "LOGIN",
                    entity: "Auth",
                    status: "FAILED",
                    message: "Login failed",
                    details: { email },
                });
                return sendError(res, "Invalid credentials", 401);
            }

            if (!employee.isActivated) {
                await createAuditLog({
                    req,
                    action: "LOGIN",
                    entity: "Auth",
                    status: "FAILED",
                    message: "Login failed: not activated",
                    details: { email },
                });
                return sendError(res, "Account not activated", 403);
            }

            if (!employee.isActive) {
                await createAuditLog({
                    req,
                    action: "LOGIN",
                    entity: "Auth",
                    status: "FAILED",
                    message: "Login failed: deactivated",
                    details: { email },
                });
                return sendError(res, "Account is deactivated", 403);
            }

            // 🔒 ACCOUNT LOCK CHECK (⬅️ THIS IS WHAT YOU MISSED)
            if (employee.isLocked()) {
                await createAuditLog({
                    req,
                    action: "LOGIN",
                    entity: "Auth",
                    status: "FAILED",
                    message: "Login failed: locked",
                    details: { email },
                });
                return sendError(
                    res,
                    "Account is temporarily locked. Try again later.",
                    423,
                );
            }

            const isMatch = await employee.comparePassword(password);

            // ❌ WRONG PASSWORD
            if (!isMatch) {
                employee.loginAttempts += 1;

                // Lock after 5 failed attempts
                if (employee.loginAttempts >= 5) {
                    employee.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
                }

                await employee.save();

                await LoginAudit.create({
                    userId: employee._id,
                    companyId: employee.compnayId,
                    email,
                    role: employee.role,
                    status: "FAILED",
                    ipAddress: req.ip,
                    userAgent: req.headers["user-agent"],
                });
                await createAuditLog({
                    req,
                    action: "LOGIN",
                    entity: "Auth",
                    status: "FAILED",
                    message: "Login failed: wrong password",
                    details: { email },
                });

                return sendError(res, "Invalid credentials", 401);
            }

            // ✅ SUCCESSFUL LOGIN → RESET LOCK
            employee.loginAttempts = 0;
            employee.lockUntil = undefined;
            await employee.save();

            const token = jwt.sign(
                {
                    userId: employee._id,
                    employeeId: employee._id,
                    role: employee.role,
                    teamLeader: employee.teamLeader,
                    companyId: employee.compnayId,
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" },
            );

            const isProd = process.env.NODE_ENV === "production";
            res.cookie("token", token, {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "none" : "lax",
                maxAge: 24 * 60 * 60 * 1000,
            });

            await LoginAudit.create({
                userId: employee._id,
                companyId: employee.compnayId,
                email,
                role: employee.role,
                status: "SUCCESS",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            await createAuditLog({
                req,
                user: {
                    userId: employee._id,
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                },
                action: "LOGIN",
                entity: "Auth",
                status: "SUCCESS",
                message: "Login successful",
            });

            const company = employee.compnayId
                ? await Company.findById(employee.compnayId).select("name")
                : null;

            sendResponse(res, "Login successful", { 
                token, 
                user: { 
                    _id: employee._id, 
                    name: employee.name, 
                    email: employee.email, 
                    role: employee.role,
                    teamLeader: employee.teamLeader,
                    companyId: employee.compnayId,
                    companyName: company?.name,
                } 
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =========================
    // REFRESH CURRENT USER
    // =========================
    async getMe(req, res) {
        try {
            const employee = await Employee.findById(req.user.userId);
            if (!employee) {
                return sendError(res, "User not found", 404);
            }

            const company = employee.compnayId
                ? await Company.findById(employee.compnayId).select("name")
                : null;

            sendResponse(res, "User fetched", {
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                teamLeader: employee.teamLeader,
                companyId: employee.compnayId,
                companyName: company?.name,
            });
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =========================
    // NEW EMPLOYEE ACTIVATION
    // =========================
    async activateAccount(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendError(res, "Email and password are required", 400);
            }

            const employee = await Employee.findOne({ email });

            if (!employee) {
                return sendError(
                    res,
                    "You are not registered in the company",
                    403,
                );
            }

            if (employee.isActivated) {
                return sendError(res, "Account already activated", 400);
            }

            employee.password = password;
            employee.isActivated = true;
            employee.passwordChangedAt = Date.now();

            await employee.save();

            sendResponse(res, "Account activated successfully");
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =========================
    // CHANGE PASSWORD (PROFILE)
    // =========================
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return sendError(res, "All fields are required", 400);
            }

            const employee = await Employee.findById(req.user.userId).select(
                "+password",
            );

            if (!employee) {
                return sendError(res, "User not found", 404);
            }

            const isMatch = await employee.comparePassword(currentPassword);
            if (!isMatch) {
                return sendError(res, "Current password is incorrect", 401);
            }

            employee.password = newPassword;
            employee.passwordChangedAt = Date.now();
            await employee.save();

            sendResponse(res, "Password changed successfully");
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const normalizedEmail = String(email || "").trim();
            const safeEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const emailRegex = new RegExp(`^${safeEmail}$`, "i");

            const employee = await Employee.findOne({
                $or: [{ email: emailRegex }, { personalEmail: emailRegex }],
            });

            // Always send same response (security)
            if (!employee) {
                return sendResponse(
                    res,
                    "If the email exists, a reset link will be sent",
                );
            }

            const resetToken = employee.createPasswordResetToken();
            await employee.save({ validateBeforeSave: false });

            const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;

            try {
                const sendResetEmails =
                    String(process.env.SEND_PASSWORD_EMAILS || "true") !== "false";
                if (sendResetEmails) {
                    await sendEmail({
                        to: employee.personalEmail || employee.email,
                        subject: "HRMS Password Reset Link",
                        html: `
              <p>Hello ${employee.name || "Employee"},</p>
              <p>We received a password reset request for your account.</p>
              <p>Click the link below to set a new password:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This link expires in 15 minutes.</p>
              <p>If you did not request this, you can ignore this email.</p>
            `,
                    });
                }
            } catch (error) {
                console.error("Send email failed:", error.message);
                employee.forgotPasswordToken = undefined;
                employee.forgotPasswordExpires = undefined;
                await employee.save({ validateBeforeSave: false });
                return sendError(res, "Failed to send reset email", 500);
            }

            const sendResetEmails =
                String(process.env.SEND_PASSWORD_EMAILS || "true") !== "false";
            sendResponse(
                res,
                sendResetEmails
                    ? "Reset link has been sent to your email"
                    : "Password reset emails are disabled.",
                {
                    emailDisabled: !sendResetEmails,
                },
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // =========================
    // RESET PASSWORD
    // =========================
    async resetPassword(req, res) {
        try {
            const hashedToken = crypto
                .createHash("sha256")
                .update(req.params.token)
                .digest("hex");

            const employee = await Employee.findOne({
                forgotPasswordToken: hashedToken,
                forgotPasswordExpires: { $gt: Date.now() },
            }).select("+password");

            if (!employee) {
                return sendError(res, "Token is invalid or expired", 400);
            }

            employee.password = req.body.password;
            employee.forgotPasswordToken = undefined;
            employee.forgotPasswordExpires = undefined;
            employee.passwordChangedAt = Date.now();

            await employee.save();

            sendResponse(res, "Password reset successful");
        } catch (error) {
            sendError(res, error.message);
        }
    }

    async logout(req, res) {
        const isProd = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });
        sendResponse(res, "Logged out successfully");
    }
}

module.exports = new AuthController();
