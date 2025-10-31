const mongoose = require("mongoose");

const attendanceEditRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attendance",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  originalInTime: {
    type: String
  },
  originalOutTime: {
    type: String
  },
  requestedInTime: {
    type: String
  },
  requestedOutTime: {
    type: String
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AttendanceEditRequest", attendanceEditRequestSchema);