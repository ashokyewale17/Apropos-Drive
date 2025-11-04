const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Mock employee data mapping to match the frontend mock data
const mockEmployeeMap = {
  "1": "tushar.mhaskar@company.com",
  "2": "vijay.solanki@company.com",
  "3": "pinky.chakrabarty@company.com",
  "4": "sanket.pawal@company.com",
  "5": "ashok.yewale@company.com",
  "6": "harshal.lohar@company.com",
  "7": "prasanna.pandit@company.com"
};

// Helper function to find employee by various ID formats including mock IDs
const findEmployeeByAnyId = async (id) => {
  try {
    // Handle null/undefined
    if (!id) {
      throw new Error('Employee ID is required');
    }
    
    console.log('Finding employee with ID:', id, 'Type:', typeof id);
    
    // If it's already an ObjectId, try direct lookup
    if (id instanceof mongoose.Types.ObjectId) {
      console.log('ID is already an ObjectId');
      return await Employee.findById(id);
    }
    
    // If it's a string
    if (typeof id === 'string') {
      console.log('ID is a string, trying different lookup methods');
      
      // First try direct email lookup
      let employee = await Employee.findOne({ email: id });
      if (employee) {
        console.log('Found employee by email');
        return employee;
      }
      
      // SPECIAL CASE FOR MOCK SYSTEM:
      // If the ID is a mock numeric ID, map it to the corresponding email
      if (mockEmployeeMap[id]) {
        console.log('Found mock ID, mapping to email:', mockEmployeeMap[id]);
        employee = await Employee.findOne({ email: mockEmployeeMap[id] });
        if (employee) {
          console.log('Found employee by mapped email');
          return employee;
        }
      }
      
      // Try to find by _id if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(id)) {
        try {
          employee = await Employee.findById(new mongoose.Types.ObjectId(id));
          if (employee) {
            console.log('Found employee by ObjectId string');
            return employee;
          }
        } catch (e) {
          console.log('ObjectId conversion failed:', e.message);
        }
      }
      
      // Try to find by string representation of _id
      employee = await Employee.findOne({ _id: id });
      if (employee) {
        console.log('Found employee by string _id');
        return employee;
      }
      
      // Alternative approach for numeric IDs - try to find by position
      if (/^\d+$/.test(id)) {
        const numericId = parseInt(id);
        console.log('Looking for employee by position:', numericId);
        
        // Get all active employees sorted by creation date
        const employees = await Employee.find({ isActive: true }).sort({ createdAt: 1 });
        console.log('Found', employees.length, 'active employees');
        
        if (employees.length >= numericId && numericId > 0) {
          console.log('Returning employee at position', numericId - 1);
          return employees[numericId - 1];
        }
      }
    }
    
    // If nothing found, return null
    console.log('No employee found with ID:', id);
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
    console.log('GET /employee called with:', { empId, month, year });
    
    // Find employee by various ID formats
    const employee = await findEmployeeByAnyId(empId);
    
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
    
    console.log('POST /checkin called with:', { employeeId, location });
    
    // Validate that we have an employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Find employee by various ID formats
    const employee = await findEmployeeByAnyId(employeeId);
    
    if (!employee) {
      return res.status(400).json({ 
        error: "Employee not found with provided ID: " + employeeId
      });
    }
    
    console.log('Found employee:', employee.name, employee._id);
    
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
      employeeId: employee._id, // This is now guaranteed to be a proper ObjectId
      date: today,
      inTime: new Date(),
      status: "Present"
    });
    
    console.log('Creating attendance record with employeeId:', employee._id);
    
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
    
    console.log('POST /checkout called with:', { employeeId });
    
    // Validate that we have an employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Find employee by various ID formats
    const employee = await findEmployeeByAnyId(employeeId);
    
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
    
    console.log('GET /today called with:', { employeeId });
    
    // Validate that we have an employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        error: "Employee ID is required" 
      });
    }
    
    // Find employee by various ID formats
    const employee = await findEmployeeByAnyId(employeeId);
    
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