const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Mock employee data to create if they don't exist
const mockEmployees = [
  {
    name: 'Tushar Mhaskar',
    email: 'tushar.mhaskar@company.com',
    password: 'admin123',
    department: 'Admin',
    position: 'Admin & HR',
    role: 'admin',
    salary: 80000,
    phone: '+1234567891',
    address: '123 Admin St, City, State'
  },
  {
    name: 'Vijay Solanki',
    email: 'vijay.solanki@company.com',
    password: 'test123',
    department: 'Testing',
    position: 'QA Engineer',
    role: 'employee',
    salary: 60000,
    phone: '+1234567892',
    address: '124 Test St, City, State'
  },
  {
    name: 'Pinky Chakrabarty',
    email: 'pinky.chakrabarty@company.com',
    password: 'ops123',
    department: 'Operations',
    position: 'Operations Manager',
    role: 'employee',
    salary: 65000,
    phone: '+1234567893',
    address: '125 Ops St, City, State'
  },
  {
    name: 'Sanket Pawal',
    email: 'sanket.pawal@company.com',
    password: 'design123',
    department: 'Design',
    position: 'UI/UX Designer',
    role: 'employee',
    salary: 70000,
    phone: '+1234567894',
    address: '126 Design St, City, State'
  },
  {
    name: 'Ashok Yewale',
    email: 'ashok.yewale@company.com',
    password: 'soft123',
    department: 'Software',
    position: 'Software Developer',
    role: 'employee',
    salary: 75000,
    phone: '+1234567895',
    address: '127 Software St, City, State'
  },
  {
    name: 'Harshal Lohar',
    email: 'harshal.lohar@company.com',
    password: 'soft123',
    department: 'Software',
    position: 'Senior Developer',
    role: 'employee',
    salary: 85000,
    phone: '+1234567896',
    address: '128 Senior St, City, State'
  },
  {
    name: 'Prasanna Pandit',
    email: 'prasanna.pandit@company.com',
    password: 'embed123',
    department: 'Embedded',
    position: 'Embedded Engineer',
    role: 'employee',
    salary: 80000,
    phone: '+1234567897',
    address: '129 Embedded St, City, State'
  }
];

// Helper function to ensure mock employees exist in database
const ensureMockEmployeesExist = async () => {
  try {
    for (const mockEmployee of mockEmployees) {
      // Check if employee already exists
      const existingEmployee = await Employee.findOne({ email: mockEmployee.email });
      if (!existingEmployee) {
        // Create the employee
        const employee = new Employee(mockEmployee);
        await employee.save();
        console.log('Created mock employee:', mockEmployee.name);
      }
    }
  } catch (error) {
    console.error('Error ensuring mock employees exist:', error.message);
  }
};

// Helper function to find employee by various ID formats including mock IDs
const findEmployeeByAnyId = async (id) => {
  try {
    // Handle null/undefined
    if (!id) {
      throw new Error('Employee ID is required');
    }
    
    console.log('Finding employee with ID:', id, 'Type:', typeof id);
    
    // First ensure mock employees exist
    await ensureMockEmployeesExist();
    
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
      
      // SPECIAL CASE FOR MOCK SYSTEM:
      // If the ID is a mock numeric ID (1-7), find by position
      if (/^\d+$/.test(id) && parseInt(id) >= 1 && parseInt(id) <= 7) {
        const numericId = parseInt(id);
        console.log('Looking for mock employee by position:', numericId);
        
        // Get employees sorted by creation date to maintain consistent order
        const employees = await Employee.find({ isActive: true }).sort({ createdAt: 1 });
        console.log('Found', employees.length, 'active employees');
        
        if (employees.length >= numericId) {
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