const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const Employee = require("../models/employeeModel");

const seedEmployees = async () => {
    try {
        await connectDB();

        // 🧹 Clean existing dummy employees
        await Employee.deleteMany({
            email: {
                $in: [
                    "emp2@hrms.com",
                    "emp3@hrms.com",
                    "emp4@hrms.com",
                    "emp5@hrms.com",
                    "emp6@hrms.com",
                    "emp7@hrms.com",
                    "emp8@hrms.com",
                    "emp9@hrms.com",
                    "emp10@hrms.com",
                    "emp11@hrms.com",
                ],
            },
        });



        // =========================
        // EMPLOYEE 3
        // =========================
        const emp3 = new Employee({
            employeeId: "EMP003",
            name: "Employee Three",
            email: "emp3@hrms.com",
            password: "emp@124",
            phone: "9000000003",
            role: "Employee",
            department: "Engineering",
            position: "Backend Developer",
            dateOfJoining: new Date(),
            aadharNumber: "111122223334",
            panNumber: "ABCDE1235G",
            isActive: true,
            isActivated: true,
        });
        await emp3.save();

        // =========================
        // EMPLOYEE 4
        // =========================
        const emp4 = new Employee({
            employeeId: "EMP004",
            name: "Employee Four",
            email: "emp4@hrms.com",
            password: "emp@125",
            phone: "9000000004",
            role: "Employee",
            department: "Engineering",
            position: "Frontend Developer",
            dateOfJoining: new Date(),
            aadharNumber: "111122223335",
            panNumber: "ABCDE1236H",
            isActive: true,
            isActivated: true,
        });
        await emp4.save();

        // =========================
        // EMPLOYEE 5
        // =========================
        const emp5 = new Employee({
            employeeId: "EMP005",
            name: "Employee Five",
            email: "emp5@hrms.com",
            password: "emp@126",
            phone: "9000000005",
            role: "Employee",
            department: "QA",
            position: "QA Engineer",
            dateOfJoining: new Date(),
            aadharNumber: "111122223336",
            panNumber: "ABCDE1237J",
            isActive: true,
            isActivated: true,
        });
        await emp5.save();

        // =========================
        // EMPLOYEE 6
        // =========================
        const emp6 = new Employee({
            employeeId: "EMP006",
            name: "Employee Six",
            email: "emp6@hrms.com",
            password: "emp@127",
            phone: "9000000006",
            role: "Employee",
            department: "QA",
            position: "Automation Tester",
            dateOfJoining: new Date(),
            aadharNumber: "111122223337",
            panNumber: "ABCDE1238K",
            isActive: true,
            isActivated: true,
        });
        await emp6.save();

        // =========================
        // EMPLOYEE 7
        // =========================
        const emp7 = new Employee({
            employeeId: "EMP007",
            name: "Employee Seven",
            email: "emp7@hrms.com",
            password: "emp@128",
            phone: "9000000007",
            role: "Employee",
            department: "Design",
            position: "UI Designer",
            dateOfJoining: new Date(),
            aadharNumber: "111122223338",
            panNumber: "ABCDE1239L",
            isActive: true,
            isActivated: true,
        });
        await emp7.save();

        // =========================
        // EMPLOYEE 8
        // =========================
        const emp8 = new Employee({
            employeeId: "EMP008",
            name: "Employee Eight",
            email: "emp8@hrms.com",
            password: "emp@129",
            phone: "9000000008",
            role: "Employee",
            department: "Support",
            position: "Support Engineer",
            dateOfJoining: new Date(),
            aadharNumber: "111122223339",
            panNumber: "ABCDE1240M",
            isActive: true,
            isActivated: true,
        });
        await emp8.save();

        // =========================
        // EMPLOYEE 9
        // =========================
        const emp9 = new Employee({
            employeeId: "EMP009",
            name: "Employee Nine",
            email: "emp9@hrms.com",
            password: "emp@130",
            phone: "9000000009",
            role: "Employee",
            department: "Operations",
            position: "Operations Executive",
            dateOfJoining: new Date(),
            aadharNumber: "111122223340",
            panNumber: "ABCDE1241N",
            isActive: true,
            isActivated: true,
        });
        await emp9.save();

        // =========goo================
        // EMPLOYEE 10
        // =========================
        const emp10 = new Employee({
            employeeId: "EMP010",
            name: "Employee Ten",
            email: "emp10@hrms.com",
            password: "emp@131",
            phone: "9000000010",
            role: "Employee",
            department: "Finance",
            position: "Accounts Executive",
            dateOfJoining: new Date(),
            aadharNumber: "111122223341",
            panNumber: "ABCDE1242P",
            isActive: true,
            isActivated: true,
        });
        await emp10.save();

        // =========================
        // EMPLOYEE 11
        // =========================
        const emp11 = new Employee({
            employeeId: "EMP011",
            name: "Employee Eleven",
            email: "emp11@hrms.com",
            password: "emp@132",
            phone: "9000000011",
            role: "Employee",
            department: "Operations",
            position: "Operations Analyst",
            dateOfJoining: new Date(),
            aadharNumber: "111122223342",
            panNumber: "ABCDE1243Q",
            isActive: true,
            isActivated: true,
        });
        await emp11.save();

        console.log("✅ 10 Employees seeded successfully (EMP002 → EMP011)");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
};

seedEmployees();
