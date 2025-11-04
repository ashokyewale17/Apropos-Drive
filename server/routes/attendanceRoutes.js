const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Enhanced helper function to find employee by various ID formats
const findEmployeeById = async (id) => {
  try {
    // Handle null/undefined
    if (!id) {
      throw new Error('Employee ID is required');
    }
    
    // If it's already an ObjectId, try direct lookup
    if (id instanceof mongoose.Types.ObjectId) {
      return await Employee.findById(id);
    }
    
    // If it's a string that looks like an ObjectId, try direct lookup
    if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
      try {
        return await Employee.findById(new mongoose.Types.ObjectId(id));
      } catch (e) {
        // If conversion fails, continue with other strategies
        console.warn('ObjectId conversion failed, trying alternative lookup methods:', id);
      }
    }
    
    // For numeric strings or other formats, use $or query
    if (typeof id === 'string') {
      // Try to find by email first
      let employee = await Employee.findOne({ email: id });
      if (employee) {
        return employee;
      }
      
      // Try to find by _id using string representation
      employee = await Employee.findOne({ 
        $or: [
          { _id: id },  // Direct string match
          { _id: new mongoose.Types.ObjectId(id) }  // ObjectId conversion
        ]
      }).catch(() => null);
      
      if (employee) {
        return employee;
      }
      
      // Try to find by position (for numeric IDs like "5")
      if (/^\d+$/.test(id)) {
        const numericId = parseInt(id);
        const employees = await Employee.find({ isActive: true }).sort({ createdAt: 1 });
        if (employees.length >= numericId) {
          return employees[numericId - 1];
        }
      }
    }
    
    // If nothing found, return null
    return null;
  } catch (error) {
    console.error('Error finding employee by ID:', id, error.message);
    return null;
  }
};

// Get personal attendance for an employee by month/year
router.get("/employee/:empId/:month/:year", async (req, res) => {
  const { empId, month, year } = req.params;

  try {
    // Find employee by various ID formats
    const employee = await findEmployeeById(empId);
    
    if (!employee) {
      return res.status(400).json({ 
        error: "Employee not found with provided ID: " + empId
      });
    }

    const records = await Attendance.find({
      employeeId: employee._id,
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0),
      },
    });

    res.json(records);
  } catch (error) {
    console.error('Error in GET /employee/:empId/:month/:year:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check-in endpoint
router.post("/checkin", async (req, res) => {
  try {
    const { employeeId, location } = req.body;
    
    // Validate that we have an employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Find employee by various ID formats
    const employee = await findEmployeeById(employeeId);
    
    if (!employee) {
      return res.status(400).json({ 
        error: "Employee not found with provided ID: " + employeeId
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if employee already has a check-in for today
    let attendanceRecord = await Attendance.findOne({
      employeeId: employee._id,
      date: today
    });
    
    if (attendanceRecord) {
      // If already checked in, return existing record
      return res.status(400).json({ 
        error: "Employee already checked in today",
        record: attendanceRecord
      });
    }
    
    // Create new attendance record with proper ObjectId
    attendanceRecord = new Attendance({
      employeeId: employee._id,
      date: today,
      inTime: new Date(),
      status: "Present"
    });
    
    await attendanceRecord.save();
    
    // Try to populate employee details
    try {
      await attendanceRecord.populate('employeeId', 'name department');
    } catch (populateError) {
      console.warn('Could not populate employee details:', populateError.message);
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employeeCheckIn', {
        employeeId: employeeId, // Keep original for client-side matching
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
    console.error('Error in POST /checkin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check-out endpoint
router.post("/checkout", async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    // Validate that we have an employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Find employee by various ID formats
    const employee = await findEmployeeById(employeeId);
    
    if (!employee) {
      return res.status(400).json({ 
        error: "Employee not found with provided ID: " + employeeId
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    let attendanceRecord = await Attendance.findOne({
      employeeId: employee._id,
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
    
    // Try to populate employee details
    try {
      await attendanceRecord.populate('employeeId', 'name department');
    } catch (populateError) {
      console.warn('Could not populate employee details:', populateError.message);
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employeeCheckOut', {
        employeeId: employeeId, // Keep original for client-side matching
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
    console.error('Error in POST /checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get today's attendance status for an employee
router.get("/today/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate that we have an employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Find employee by various ID formats
    const employee = await findEmployeeById(employeeId);
    
    if (!employee) {
      return res.status(400).json({ 
        error: "Employee not found with provided ID: " + employeeId
      });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance record
    const attendanceRecord = await Attendance.findOne({
      employeeId: employee._id,
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
    console.error('Error in GET /today/:employeeId:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;