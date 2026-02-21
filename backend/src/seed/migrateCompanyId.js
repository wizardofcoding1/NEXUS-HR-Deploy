const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../config/db");

const Employee = require("../models/employeeModel");
const Company = require("../models/companyModel");
const Attendance = require("../models/attandanceSchema");
const AttendancePolicy = require("../models/attendancePolicyModel");
const Payroll = require("../models/payrollSchema");
const Leave = require("../models/leaveSchema");
const Project = require("../models/projectSchema");
const Salary = require("../models/salarySchema");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const canMigrateBankDetails = Boolean(process.env.BANK_ENCRYPTION_KEY);
let BankDetails = null;
if (canMigrateBankDetails) {
    BankDetails = require("../models/bankDetailsModel");
}

const isMissingCompany = (doc) => !doc.companyId;

const buildEmployeeCompanyMap = async () => {
    const employees = await Employee.find({
        compnayId: { $exists: true, $ne: null },
    }).select("_id compnayId");

    const map = new Map();
    employees.forEach((emp) => {
        map.set(String(emp._id), emp.compnayId);
    });
    return map;
};

const bulkUpdateCompanyId = async ({ model, docs, getCompanyId }) => {
    if (!docs.length) return { matched: 0, modified: 0, skipped: 0 };

    const ops = [];
    let skipped = 0;

    docs.forEach((doc) => {
        const companyId = getCompanyId(doc);
        if (!companyId) {
            skipped += 1;
            return;
        }
        ops.push({
            updateOne: {
                filter: { _id: doc._id },
                update: { $set: { companyId } },
            },
        });
    });

    if (!ops.length) return { matched: docs.length, modified: 0, skipped };

    const result = await model.bulkWrite(ops);
    return {
        matched: result.matchedCount || ops.length,
        modified: result.modifiedCount || 0,
        skipped,
    };
};

const migrateAttendancePolicy = async () => {
    const companies = await Company.find().select("_id");
    const legacyPolicies = await AttendancePolicy.find({
        companyId: { $exists: false },
    });

    if (!legacyPolicies.length) {
        return { created: 0, updated: 0, deletedLegacy: 0 };
    }

    if (companies.length === 1) {
        const companyId = companies[0]._id;
        const updated = await AttendancePolicy.updateMany(
            { companyId: { $exists: false } },
            { $set: { companyId } }
        );
        return {
            created: 0,
            updated: updated.modifiedCount || 0,
            deletedLegacy: 0,
        };
    }

    const template = legacyPolicies[0].toObject();
    delete template._id;
    delete template.createdAt;
    delete template.updatedAt;
    delete template.__v;

    let created = 0;
    for (const company of companies) {
        const exists = await AttendancePolicy.findOne({
            companyId: company._id,
        }).select("_id");
        if (exists) continue;
        await AttendancePolicy.create({
            ...template,
            companyId: company._id,
        });
        created += 1;
    }

    const deleted = await AttendancePolicy.deleteMany({
        companyId: { $exists: false },
    });

    return {
        created,
        updated: 0,
        deletedLegacy: deleted.deletedCount || 0,
    };
};

const run = async () => {
    await connectDB();

    const employeeCompanyMap = await buildEmployeeCompanyMap();

    const attendanceDocs = await Attendance.find({ companyId: { $exists: false } })
        .select("_id employee");
    const payrollDocs = await Payroll.find({ companyId: { $exists: false } })
        .select("_id employee");
    const leaveDocs = await Leave.find({ companyId: { $exists: false } })
        .select("_id employee");
    const bankDocs = BankDetails
        ? await BankDetails.find({ companyId: { $exists: false } })
              .select("_id employee")
        : [];
    const salaryDocs = await Salary.find({ companyId: { $exists: false } })
        .select("_id employee");
    const projectDocs = await Project.find({ companyId: { $exists: false } })
        .select("_id createdBy teamLeader");

    const attendanceResult = await bulkUpdateCompanyId({
        model: Attendance,
        docs: attendanceDocs,
        getCompanyId: (doc) => employeeCompanyMap.get(String(doc.employee)),
    });

    const payrollResult = await bulkUpdateCompanyId({
        model: Payroll,
        docs: payrollDocs,
        getCompanyId: (doc) => employeeCompanyMap.get(String(doc.employee)),
    });

    const leaveResult = await bulkUpdateCompanyId({
        model: Leave,
        docs: leaveDocs,
        getCompanyId: (doc) => employeeCompanyMap.get(String(doc.employee)),
    });

    const bankResult = BankDetails
        ? await bulkUpdateCompanyId({
              model: BankDetails,
              docs: bankDocs,
              getCompanyId: (doc) => employeeCompanyMap.get(String(doc.employee)),
          })
        : { matched: 0, modified: 0, skipped: 0, warning: "Skipped (missing BANK_ENCRYPTION_KEY)" };

    const salaryResult = await bulkUpdateCompanyId({
        model: Salary,
        docs: salaryDocs,
        getCompanyId: (doc) => employeeCompanyMap.get(String(doc.employee)),
    });

    const projectResult = await bulkUpdateCompanyId({
        model: Project,
        docs: projectDocs,
        getCompanyId: (doc) =>
            employeeCompanyMap.get(String(doc.createdBy)) ||
            employeeCompanyMap.get(String(doc.teamLeader)),
    });

    const policyResult = await migrateAttendancePolicy();

    console.log("CompanyId migration results:");
    console.log("Attendance:", attendanceResult);
    console.log("Payroll:", payrollResult);
    console.log("Leaves:", leaveResult);
    console.log("BankDetails:", bankResult);
    console.log("Salary:", salaryResult);
    console.log("Projects:", projectResult);
    console.log("AttendancePolicy:", policyResult);

    await mongoose.connection.close();
    process.exit(0);
};

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
