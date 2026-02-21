const Salary = require("../models/salarySchema");

const sendResponse = require("../utils/responseHandler");
const sendError = require("../utils/errorHandler");


class SalaryController{

    //create / Update Salary Structure
    async updateSalary(req, res){
        try{
            const salary = await Salary.findOneAndUpdate(
                {
                    employee: req.body.employee,
                    ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
                },
                { ...req.body, companyId: req.user?.companyId },
                {new : true, upsert: true}
            );

            sendResponse(res, "Salary Structure Saved", salary);
        }catch(error){
            sendError(res, error.message);
        }
    }

    //Get Salary by Employee
    async getSalaryByEmployee(req, res){
        try{
            const salary = await Salary.findOne({
                employee: req.params.employeeId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!salary){
                return sendError(res, "Salary Not Found", 404);
            }
            sendResponse(res, "Salary Fetched Successfully", salary);

        }catch(error){
            sendError(res, error.message);
        }
    }

    //Get My Salary (Employee)
    async getMySalary(req, res){
        try{
            const salary = await Salary.findOne({
                employee: req.user.userId,
                ...(req.user?.companyId ? { companyId: req.user.companyId } : {}),
            });
            if (!salary){
                return sendError(res, "Salary Not Found", 404);
            }
            sendResponse(res, "My Salary Fetched", salary);
        }catch(error){
            sendError(res, error.message);
        }
    }
}

module.exports = new SalaryController();
