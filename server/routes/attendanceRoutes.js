const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Enhanced helper function to process employeeId
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
      
      // If it's a valid ObjectId string, convert it
      if (mongoose.Types.ObjectId.isValid(id)) {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (convertError) {
          console.warn('Failed to convert to ObjectId, using string:', id);
          // Instead of throwing an error, we'll return the string and let the database query handle validation
          return id;
        }
      }
      
      // If not a valid ObjectId string, but not empty, return as is
      if (id.length > 0) {
        return id;
      }
    }
    
    // For numbers, convert to string
    if (typeof id === 'number') {
      return id.toString();
    }
    
    // Return as is for any other case
    return id;
  } catch (error) {
    console.warn('Error processing employeeId, using original:', id, error.message);
    return id;
  }
};

// Get personal attendance for an employee by month/year
router.get("/employee/:empId/:month/:year", async (req, res) => {
  const { empId, month, year } = req.params;

  try {
    // Process employeeId
    let processedEmpId = processEmployeeId(empId);
    console.log('GET /employee - Processing employeeId:', { original: empId, processed: processedEmpId });

    // If employeeId is not an ObjectId, try to find the employee and get the real ObjectId
    if (!(processedEmpId instanceof mongoose.Types.ObjectId)) {
      // Build query conditions based on whether the value is a valid ObjectId or not
      const queryConditions = [];
      
      // Only add _id condition if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(processedEmpId)) {
        queryConditions.push({ _id: processedEmpId });
      }
      
      // Add conditions for non-ObjectId values
      queryConditions.push({ email: processedEmpId });
      
      // Also check for string representation of _id
      queryConditions.push({ _id: processedEmpId });
      
      const employee = await Employee.findOne({
        $or: queryConditions
      });
      
      if (!employee) {
        return res.status(400).json({ 
          error: "Employee not found with provided ID: " + empId
        });
      }
      
      processedEmpId = employee._id;
    }

    const records = await Attendance.find({
      employeeId: processedEmpId,
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
    
    // Process employeeId
    let processedEmpId = processEmployeeId(employeeId);
    console.log('POST /checkin - Processing employeeId:', { original: employeeId, processed: processedEmpId });
    
    // Validate that we have an employeeId
    if (!processedEmpId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // If employeeId is not an ObjectId, try to find the employee and get the real ObjectId
    if (!(processedEmpId instanceof mongoose.Types.ObjectId)) {
      // Build query conditions based on whether the value is a valid ObjectId or not
      const queryConditions = [];
      
      // Only add _id condition if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(processedEmpId)) {
        queryConditions.push({ _id: processedEmpId });
      }
      
      // Add conditions for non-ObjectId values
      queryConditions.push({ email: processedEmpId });
      
      // Also check for string representation of _id
      queryConditions.push({ _id: processedEmpId });
      
      const employee = await Employee.findOne({
        $or: queryConditions
      });
      
      if (!employee) {
        return res.status(400).json({ 
          error: "Employee not found with provided ID: " + employeeId
        });
      }
      
      processedEmpId = employee._id;
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
    
    // Create new attendance record
    attendanceRecord = new Attendance({
      employeeId: processedEmpId,
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
    
    // Process employeeId
    let processedEmpId = processEmployeeId(employeeId);
    console.log('POST /checkout - Processing employeeId:', { original: employeeId, processed: processedEmpId });
    
    // Validate that we have an employeeId
    if (!processedEmpId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // If employeeId is not an ObjectId, try to find the employee and get the real ObjectId
    if (!(processedEmpId instanceof mongoose.Types.ObjectId)) {
      // Build query conditions based on whether the value is a valid ObjectId or not
      const queryConditions = [];
      
      // Only add _id condition if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(processedEmpId)) {
        queryConditions.push({ _id: processedEmpId });
      }
      
      // Add conditions for non-ObjectId values
      queryConditions.push({ email: processedEmpId });
      
      // Also check for string representation of _id
      queryConditions.push({ _id: processedEmpId });
      
      const employee = await Employee.findOne({
        $or: queryConditions
      });
      
      if (!employee) {
        return res.status(400).json({ 
          error: "Employee not found with provided ID: " + employeeId
        });
      }
      
      processedEmpId = employee._id;
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
    
    // Process employeeId
    let processedEmpId = processEmployeeId(employeeId);
    console.log('GET /today - Processing employeeId:', { original: employeeId, processed: processedEmpId });
    
    // Validate that we have an employeeId
    if (!processedEmpId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // If employeeId is not an ObjectId, try to find the employee and get the real ObjectId
    if (!(processedEmpId instanceof mongoose.Types.ObjectId)) {
      // Build query conditions based on whether the value is a valid ObjectId or not
      const queryConditions = [];
      
      // Only add _id condition if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(processedEmpId)) {
        queryConditions.push({ _id: processedEmpId });
      }
      
      // Add conditions for non-ObjectId values
      queryConditions.push({ email: processedEmpId });
      
      // Also check for string representation of _id
      queryConditions.push({ _id: processedEmpId });
      
      const employee = await Employee.findOne({
        $or: queryConditions
      });
      
      if (!employee) {
        return res.status(400).json({ 
          error: "Employee not found with provided ID: " + employeeId
        });
      }
      
      processedEmpId = employee._id;
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
    console.error('Error in GET /today/:employeeId:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
