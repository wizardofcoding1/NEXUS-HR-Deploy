const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({

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

  leaveType: {
    type: String,
    enum: ['Casual', 'Sick', 'Paid', 'Unpaid'],
    required: true
  },

  startDate: Date,
  endDate: Date,

  reason: String,

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }

}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
