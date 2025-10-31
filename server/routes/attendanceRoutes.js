const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// Get personal attendance for an employee by month/year
router.get("/employee/:empId/:month/:year", async (req, res) => {
  const { empId, month, year } = req.params;

  try {
    const records = await Attendance.find({
      employeeId: empId,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0),
      },
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-in endpoint
router.post("/checkin", async (req, res) => {
  try {
    const { employeeId, location } = req.body;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if employee already has a check-in for today
    let attendanceRecord = await Attendance.findOne({
      employeeId: employeeId,
      date: today
    });
    
    if (attendanceRecord) {
      // If already checked in, return existing record
      return res.status(400).json({ 
        error: "Employee already checked in today",
        record: attendanceRecord
      });
    }
    
    // Create new attendance record
    attendanceRecord = new Attendance({
      employeeId: employeeId,
      date: today,
      inTime: new Date(),
      status: "Present"
    });
    
    await attendanceRecord.save();
    
    // Populate employee details
    await attendanceRecord.populate('employeeId', 'name department');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employeeCheckIn', {
        employeeId: employeeId,
        employeeName: attendanceRecord.employeeId.name,
        department: attendanceRecord.employeeId.department,
        checkInTime: attendanceRecord.inTime,
        location: location || 'Office'
      });
    }
    
    res.status(201).json({
      message: "Check-in successful",
      record: attendanceRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out endpoint
router.post("/checkout", async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    let attendanceRecord = await Attendance.findOne({
      employeeId: employeeId,
      date: today
    });
    
    if (!attendanceRecord) {
      return res.status(400).json({ 
        error: "No check-in record found for today"
      });
    }
    
    if (attendanceRecord.outTime) {
      return res.status(400).json({ 
        error: "Employee already checked out today",
        record: attendanceRecord
      });
    }
    
    // Update checkout time
    attendanceRecord.outTime = new Date();
    await attendanceRecord.save();
    
    // Calculate hours worked
    const checkInTime = new Date(attendanceRecord.inTime);
    const checkOutTime = new Date(attendanceRecord.outTime);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const hoursWorked = `${diffHours}h ${diffMinutes}m`;
    
    // Populate employee details
    await attendanceRecord.populate('employeeId', 'name department');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employeeCheckOut', {
        employeeId: employeeId,
        employeeName: attendanceRecord.employeeId.name,
        department: attendanceRecord.employeeId.department,
        checkOutTime: attendanceRecord.outTime,
        hoursWorked: hoursWorked
      });
    }
    
    res.json({
      message: "Check-out successful",
      record: attendanceRecord,
      hoursWorked: hoursWorked
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's attendance status for an employee
router.get("/today/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    const attendanceRecord = await Attendance.findOne({
      employeeId: employeeId,
      date: today
    }).populate('employeeId', 'name department');
    
    if (!attendanceRecord) {
      return res.json({ 
        isCheckedIn: false,
        message: "No attendance record for today"
      });
    }
    
    res.json({
      isCheckedIn: !!attendanceRecord.inTime && !attendanceRecord.outTime,
      isCheckedOut: !!attendanceRecord.outTime,
      record: attendanceRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;