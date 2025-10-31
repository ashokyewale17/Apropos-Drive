const mongoose = require("mongoose");

// Custom type that accepts both ObjectId and String
const FlexibleId = {
  type: mongoose.Schema.Types.Mixed,
  required: true,
  set: function(v) {
    // If it's already an ObjectId, return as is
    if (v instanceof mongoose.Types.ObjectId) {
      return v;
    }
    // If it's a string that looks like an ObjectId, convert it
    if (typeof v === 'string' && mongoose.Types.ObjectId.isValid(v)) {
      try {
        return new mongoose.Types.ObjectId(v);
      } catch (e) {
        // If conversion fails, return the original value
        return v;
      }
    }
    // For any other case, return as is (including simple strings like "5")
    return v;
  }
};

const attendanceSchema = new mongoose.Schema({
  employeeId: FlexibleId,
  date: {
    type: Date,
    required: true
  },
  inTime: {
    type: Date
  },
  outTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave", "Holiday"],
    default: "Present"
  }
}, {
  timestamps: true // Add createdAt and updatedAt fields
});

// Add a pre-save hook to handle employeeId conversion
attendanceSchema.pre('save', function(next) {
  if (this.employeeId) {
    // If employeeId is a string and looks like an ObjectId, convert it
    if (typeof this.employeeId === 'string' && mongoose.Types.ObjectId.isValid(this.employeeId)) {
      try {
        this.employeeId = new mongoose.Types.ObjectId(this.employeeId);
      } catch (e) {
        // If conversion fails, leave it as is
        console.warn('Failed to convert employeeId to ObjectId:', this.employeeId);
      }
    }
  }
  next();
});

// Add indexes for better query performance
attendanceSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
