const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  
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

  month: {
    type: String, // "Jan-2026"
    required: true
  },

  grossSalary: Number,
  deductions: Number,
  netPay: Number,
  overtimeHours: {
    type: Number,
    default: 0,
  },
  overtimeRate: {
    type: Number,
    default: 0,
  },
  halfDayLeaves: {
    type: Number,
    default: 0,
  },
  halfDayDeduction: {
    type: Number,
    default: 0,
  },
  paidLeaveDays: {
    type: Number,
    default: 0,
  },
  paidLeaveDeduction: {
    type: Number,
    default: 0,
  },
  travelAllowance: {
    type: Number,
    default: 300,
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  payCycle: {
    type: String,
    enum: ["Half", "Full", "Remaining"],
    default: "Full",
  },
  referenceId: {
    type: String,
    default: null,
  },

  paidOn: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  payDate: {
    type: Date,
    default: null,
  }

}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
