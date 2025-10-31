const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { authenticateToken, requireAdmin, requireAdminOrSelf } = require('../middleware/auth');

// @route   GET /api/employees
// @desc    Get all employees (Admin only) or current user profile (Employee)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, department, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    // If user is not admin, they can only see their own profile
    if (req.user.role !== 'admin') {
      return res.json({
        employees: [req.user],
        pagination: {
          current: 1,
          pages: 1,
          total: 1
        }
      });
    }
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Department filter
    if (department && department !== 'all') {
      query.department = department;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      employees,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee (Admin or self only)
// @access  Private
router.get('/:id', authenticateToken, requireAdminOrSelf, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/employees
// @desc    Create new employee (Admin only)
// @access  Private (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, position, department, salary, phone, address } = req.body;
    
    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email, isActive: true });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }
    
    const employee = new Employee({
      name,
      email,
      password: password || 'password123', // Default password
      role: role || 'employee',
      position,
      department,
      salary,
      phone,
      address
    });
    
    await employee.save();
    
    // Remove password from response
    const employeeResponse = await Employee.findById(employee._id);
    res.status(201).json(employeeResponse);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee (Admin or self only)
// @access  Private
router.put('/:id', authenticateToken, requireAdminOrSelf, async (req, res) => {
  try {
    const { name, email, position, department, salary, phone, address, role } = req.body;
    
    // Check if another employee with the same email exists
    if (email) {
      const existingEmployee = await Employee.findOne({ 
        email, 
        _id: { $ne: req.params.id },
        isActive: true
      });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Another employee with this email already exists' });
      }
    }
    
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(position && { position }),
      ...(department && { department }),
      ...(salary && { salary }),
      ...(phone && { phone }),
      ...(address && { address })
    };
    
    // Only admin can change roles
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully', employee });
  } catch (error) {
    console.error('Error deleting employee:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/employees/stats/departments
// @desc    Get department statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/departments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/employees/stats/overview
// @desc    Get overview statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const totalAdmins = await Employee.countDocuments({ isActive: true, role: 'admin' });
    
    const departmentCount = await Employee.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department' } },
      { $count: 'totalDepartments' }
    ]);
    
    const totalDepartments = departmentCount[0]?.totalDepartments || 0;
    
    const recentJoins = await Employee.countDocuments({
      isActive: true,
      dateOfJoining: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalEmployees,
      totalAdmins,
      totalDepartments,
      recentJoins
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

