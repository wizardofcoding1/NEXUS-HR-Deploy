const BankDetails = require("../models/bankDetailsModel");

const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");
const { createAuditLog } = require("../utils/auditLogger");

class BankDetailsController {
    //Add or Update Bank Detials (HR or Employee)
    async upsertBankDetails(req, res) {
        try {
            const targetEmployeeId = req.body.employeeId || req.user.userId;
            const isOwner = req.user.userId === targetEmployeeId;
            const isEmployeeRole =
                req.user.role === "Employee" || req.user.role === "TeamLeader";
            if (req.user.role === "HR" && !isOwner) {
                return sendError(
                    res,
                    "HR can only update their own bank details",
                    403,
                );
            }
            if (isEmployeeRole && !isOwner) {
                return sendError(
                    res,
                    "Only the employee can update their bank details",
                    403,
                );
            }
            
            const bankDetails = await BankDetails.findOneAndUpdate(
                {
                    employee: targetEmployeeId,
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                },
                { ...req.body, employee: targetEmployeeId, companyId: req.user.companyId },
                { new: true, upsert: true },
            );
            await createAuditLog({
                req,
                action: "UPDATE",
                entity: "BankDetails",
                entityId: String(bankDetails._id),
                message: "Bank details updated",
                details: { employeeId: String(targetEmployeeId) },
            });
            sendResponse(
                res,
                "Bank Details Saved Successfully",
                null, // Don't return sensitive data here
                null,
                201,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    // Get All Bank Details (HR) - Masked
    async getAllBankDetails(req, res) {
        try {
            const allDetails = await BankDetails.find(
                req.user?.companyId ? { companyId: req.user.companyId } : {}
            ).populate(
                "employee",
                "name email role",
            );
            
            const filteredDetails =
                req.user.role === "HR"
                    ? allDetails.filter(
                          (detail) =>
                              detail.employee?.role === "Employee" ||
                              detail.employee?.role === "TeamLeader",
                      )
                    : allDetails;

            const maskedDetails = filteredDetails.map(detail => {
                const decrypted = detail.decryptFields();
                // Mask Account Number: Show only last 4 digits
                const accNum = decrypted.accountNumber;
                const maskedAccNum = accNum.length > 4 
                    ? "XXXX" + accNum.slice(-4) 
                    : accNum;

                return {
                    _id: detail._id,
                    employee: detail.employee,
                    accountHolderName: decrypted.accountHolderName,
                    accountNumber: maskedAccNum, // MASKED
                    ifscCode: decrypted.ifscCode,
                    bankName: decrypted.bankName,
                    upiId: decrypted.upiId
                };
            });

            sendResponse(res, "All Bank Details Fetched", maskedDetails, maskedDetails.length);
        } catch (error) {
             sendError(res, error.message);
        }
    }

    // View My Bank Details (Employee/HR)
    async getMyBankDetails(req, res) {
        try {
            const bankDetails = await BankDetails.findOne({
                employee: req.user.userId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            }).populate("employee", "role");

            if (!bankDetails) {
                return sendError(res, "Bank details not found", 404);
            }

            const decryptedData = bankDetails.decryptFields();
            sendResponse(
                res,
                "Bank details fetched successfully",
                decryptedData,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    //View Bank Details (HR or OWNER Employeee)
    async getBankDetails(req, res) {
        try {
            const bankDetails = await BankDetails.findOne({
                employee: req.params.employeeId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            }).populate("employee", "role");
            if (!bankDetails) {
                return sendError(res, "Bank detaiks not found", 404);
            }

            if (req.user.role === "Employee" || req.user.role === "TeamLeader") {
                if (req.user.userId !== req.params.employeeId) {
                    return sendError(res, "Unauthorized Access", 403);
                }
            }

            if (req.user.role === "HR") {
                const targetRole = bankDetails.employee?.role;
                const isOwner = req.user.userId === req.params.employeeId;
                if (
                    !isOwner &&
                    targetRole !== "Employee" &&
                    targetRole !== "TeamLeader"
                ) {
                    return sendError(
                        res,
                        "HR can only view employee bank details",
                        403,
                    );
                }
            }

            const decryptedData = bankDetails.decryptFields();
            sendResponse(
                res,
                "Bank details fetched successfully",
                decryptedData,
            );
        } catch (error) {
            sendError(res, error.message);
        }
    }

    //Delete Bank Detials(HR Only)
    async deleteBankDetails(req, res) {
        try {
            if (req.user.role !== "HR") {
                return sendError(res, "Only HR Can Delete Bank Details", 403);
            }
            const deleted = await BankDetails.findOneAndDelete({
                employee: req.params.employeeId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!deleted) {
                return sendError(res, "Bank details not found", 404);
            }
            sendResponse(res, "Bank details deleted successfully");
        } catch (error) {
            sendError(res, error.message);
        }
    }
}

module.exports = new BankDetailsController();
