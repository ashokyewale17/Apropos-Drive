// server/routes/employeeRoutes.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Add new employee
router.post("/", async (req, res) => {
  try {
    console.log("Received data:", req.body); // 👈 check server logs
    const { name, email, role, password, employeeId, position, department, salary, phone, address, hireDate } = req.body;

    const newEmployee = new Employee({ 
      employeeId,
      name, 
      email, 
      role, 
      password,
      position,
      department,
      salary: salary || 0,
      phone,
      address,
      dateOfJoining: hireDate ? new Date(hireDate) : new Date()
    });
    await newEmployee.save();

    res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
