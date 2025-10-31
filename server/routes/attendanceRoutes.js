const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Enhanced helper function to handle employeeId conversion
const processEmployeeId = (id) => {
  try {
    // Handle null/undefined
    if (!id) {
      throw new Error('Employee ID is required');
    }
    
    // If it's already an ObjectId, return as is
    if (id instanceof mongoose.Types.ObjectId) {
      return id;
    }
    
    // If it's a string
    if (typeof id === 'string') {
      // Trim whitespace
      id = id.trim();
      
      // Check if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
      }
      
      // If not a valid ObjectId, but it's a non-empty string, use as is
      if (id.length > 0) {
        return id;
      }
    }
    
    // For numbers or other types, convert to string
    if (typeof id === 'number') {
      return id.toString();
    }
    
    // Return as is for any other case
    return id;
  } catch (error) {
    console.warn('Failed to process employeeId, using original:', id, error.message);
    return id;
  }
};

// Get personal attendance for an employee by month/year
router.get("/employee/:empId/:month/:year", async (req, res) => {
  const { empId, month, year } = req.params;

  try {
    // Process employeeId with enhanced error handling
    const employeeId = processEmployeeId(empId);
    console.log('Processing employeeId for GET:', { original: empId, processed: employeeId, type: typeof employeeId });

    const records = await Attendance.find({
      employeeId: employeeId,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0),
      },
    });

    res.json(records);
  } catch (error) {
    console.error('Error in /employee/:empId/:month/:year:', {
      error: error.message,
      employeeId: req.params.empId,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

// Check-in endpoint
router.post("/checkin", async (req, res) => {
  try {
    const { employeeId, location } = req.body;
    
    // Process employeeId with enhanced error handling
    const processedEmpId = processEmployeeId(employeeId);
    console.log('Processing employeeId for checkin:', { original: employeeId, processed: processedEmpId, type: typeof processedEmpId });
    
    // Validate that we have an employeeId
    if (!processedEmpId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if employee already has a check-in for today
    let attendanceRecord = await Attendance.findOne({
      employeeId: processedEmpId,
      date: today
    });
    
    if (attendanceRecord) {
      // If already checked in, return existing record
      return res.status(400).json({ 
        error: "Employee already checked in today",
        record: attendanceRecord
      });
    }
    
    // Verify employee exists (only if we have a valid ObjectId format)
    if (processedEmpId instanceof mongoose.Types.ObjectId || 
        (typeof processedEmpId === 'string' && mongoose.Types.ObjectId.isValid(processedEmpId))) {
      const employee = await Employee.findById(processedEmpId);
      if (!employee) {
        return res.status(400).json({ 
          error: "Employee not found" 
        });
      }
    }
    
    // Create new attendance record
    attendanceRecord = new Attendance({
      employeeId: processedEmpId,
      date: today,
      inTime: new Date(),
      status: "Present"
    });
    
    await attendanceRecord.save();
    
    // Populate employee details (if employeeId is a valid ObjectId)
    try {
      await attendanceRecord.populate('employeeId', 'name department');
    } catch (populateError) {
      console.warn('Could not populate employee details:', populateError.message);
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employeeCheckIn', {
        employeeId: employeeId, // Keep original string ID for client-side
        employeeName: attendanceRecord.employeeId?.name || 'Unknown',
        department: attendanceRecord.employeeId?.department || 'Unknown',
        checkInTime: attendanceRecord.inTime,
        location: location || 'Office'
      });
    }
    
    res.status(201).json({
      message: "Check-in successful",
      record: attendanceRecord
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('Check-in error:', {
      error: error.message,
      employeeId: req.body.employeeId,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

// Check-out endpoint
router.post("/checkout", async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    // Process employeeId with enhanced error handling
    const processedEmpId = processEmployeeId(employeeId);
    console.log('Processing employeeId for checkout:', { original: employeeId, processed: processedEmpId, type: typeof processedEmpId });
    
    // Validate that we have an employeeId
    if (!processedEmpId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    let attendanceRecord = await Attendance.findOne({
      employeeId: processedEmpId,
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
    
    // Populate employee details (if employeeId is a valid ObjectId)
    try {
      await attendanceRecord.populate('employeeId', 'name department');
    } catch (populateError) {
      console.warn('Could not populate employee details:', populateError.message);
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employeeCheckOut', {
        employeeId: employeeId, // Keep original string ID for client-side
        employeeName: attendanceRecord.employeeId?.name || 'Unknown',
        department: attendanceRecord.employeeId?.department || 'Unknown',
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
    // Log the full error for debugging
    console.error('Check-out error:', {
      error: error.message,
      employeeId: req.body.employeeId,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

// Get today's attendance status for an employee
router.get("/today/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Process employeeId with enhanced error handling
    const processedEmpId = processEmployeeId(employeeId);
    console.log('Processing employeeId for today:', { original: employeeId, processed: processedEmpId, type: typeof processedEmpId });
    
    // Validate that we have an employeeId
    if (!processedEmpId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    const attendanceRecord = await Attendance.findOne({
      employeeId: processedEmpId,
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
    // Log the full error for debugging
    console.error('Today status error:', {
      error: error.message,
      employeeId: req.params.employeeId,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
