const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("../config/db");
const Employee = require("../models/employeeModel");
const BankDetails = require("../models/bankDetailsModel");

const seedBankDetails = async () => {
    try {
        await connectDB();
        console.log("🔌 Connected for seeding...");

        // 1. Get existing employees
        const employees = await Employee.find({});
        if (employees.length === 0) {
            console.log("❌ No employees found. Seed employees first!");
            process.exit(1);
        }

        // 2. Clear old bank data
        await BankDetails.deleteMany({});

        // 3. Dummy Data Map
        const dummyBankData = [
            { email: "sasuke@hrms.com", acc: "50100111222333", ifsc: "HDFC0001234", bank: "HDFC Bank" },
            { email: "boruto@hrms.com", acc: "20300444555666", ifsc: "SBIN0004321", bank: "SBI" },
            { email: "emp3@hrms.com", acc: "100000000003", ifsc: "ICIC0001003", bank: "ICICI" },
            { email: "emp4@hrms.com", acc: "100000000004", ifsc: "UTIB0001004", bank: "Axis Bank" },
            { email: "emp5@hrms.com", acc: "100000000005", ifsc: "KKBK0001005", bank: "Kotak" }
        ];

        for (const data of dummyBankData) {
            const emp = employees.find(e => e.email === data.email);
            if (emp) {
                await BankDetails.create({
                    employee: emp._id,
                    accountHolderName: emp.name,
                    accountNumber: data.acc, // Pre-save hook will encrypt this
                    ifscCode: data.ifsc,      // Pre-save hook will encrypt this
                    bankName: data.bank,
                    upiId: `${emp.name.split(' ')[0].toLowerCase()}@okbank`
                });
                console.log(`✅ Seeded bank for: ${emp.email}`);
            }
        }

        console.log("🚀 All bank details seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error.message);
        process.exit(1);
    }
};

seedBankDetails();