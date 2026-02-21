const Leave = require("../models/leaveSchema");
const Notification = require("../models/notifiactionModel");

const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");

class LeaveController{

    //Apply Leave
    async applyLeave(req, res){
        try{
            const { leaveType, startDate, endDate, reason } = req.body;
            if (startDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (new Date(startDate) < today) {
                    return sendError(res, "Start date cannot be in the past", 400);
                }
            }
            if (endDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (new Date(endDate) < today) {
                    return sendError(res, "End date cannot be in the past", 400);
                }
            }
            if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                return sendError(res, "End date cannot be before start date", 400);
            }
            const leave = await Leave.create({
                employee: req.user.userId,
                companyId: req.user.companyId,
                leaveType,
                startDate,
                endDate,
                reason,
            });

            if (global.io) {
                global.io.emit("leave:created", { leaveId: leave._id });
            }
            sendResponse(res, "Leave Applied Successfully", leave, null,201);
        }catch(error){
            sendError(res,error.message);
        }
    }

    //Get My Leaves (Employee)
    async getMyLeaves(req, res){
        try{
            const leaves = await Leave.find({
                employee: req.user.userId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            })
                .sort({ createdAt: -1 });
            sendResponse(res, "My Leaves Fetched", leaves, leaves.length);
        }catch(error){
            sendError(res, error.message);
        }
    }

    //Get All Leave Requests
    async getAllLeaves(req, res){
        try{
            const query = {};
            if (req.user?.companyId) {
                query.companyId = req.user.companyId;
            }
            if (req.query.status) {
                query.status = req.query.status;
            }

            const leaves = await Leave.find(query)
                .populate("employee approvedBy")
                .sort({ createdAt: -1 });
            sendResponse(res, "Leave Request Fetched",leaves,leaves.length)
        }catch(error){
            sendError(res, error.message);
        }
    }

    //Approve / Reject Leave
    async updateLeaveStatus(req,res){
        try{
            const { status } = req.body;
            if (!["Approved", "Rejected"].includes(status)) {
                return sendError(res, "Invalid leave status", 400);
            }

            const leave = await Leave.findOne({
                _id: req.params.id,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            }).populate("employee");
            if(!leave){
                return sendError(res, "Leave Request Not Found", 400);
            }

            leave.status = status;
            leave.approvedBy = req.user.userId;
            await leave.save();

            const start = new Date(leave.startDate).toLocaleDateString();
            const end = new Date(leave.endDate).toLocaleDateString();
            const lowerStatus = status.toLowerCase();

            await Notification.create({
                recipient: leave.employee._id,
                title: `Leave ${status}`,
                message: `Your ${leave.leaveType} leave (${start} - ${end}) was ${lowerStatus}.`,
                type: status === "Approved" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
                referenceId: leave._id,
            });

            if (global.io) {
                global.io
                    .to(leave.employee._id.toString())
                    .emit("leave:status", {
                        leaveId: leave._id,
                        status,
                    });
            }

            sendResponse(res, "Leave Status Updated", leave);
        }catch(error){
            sendError(res,error.message);
        }
    }
}

module.exports = new LeaveController();
