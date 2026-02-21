const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({

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

  date: {
    type: Date,
    required: true
  },

  checkIn: Date,
  checkOut: Date,
  workedMinutes: {
    type: Number,
    default: 0
  },
  lateIn: {
    type: Boolean,
    default: false
  },
  earlyOut: {
    type: Boolean,
    default: false
  },
  overtimeMinutes: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-Day', 'Full-Day', 'Late-In', 'Early-Out', 'Overtime'],
    default: 'Present'
  }

}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
