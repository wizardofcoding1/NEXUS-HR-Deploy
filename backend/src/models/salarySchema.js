const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({

  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  basic: Number,
  hra: Number,
  allowances: Number,

  deductions: {
    pf: Number,
    tax: Number
  },

  netSalary: Number,

  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String
  }

}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
