// server/routes/employeeRoutes.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Add new employee
router.post("/", async (req, res) => {
  try {
    console.log("Received data:", req.body); // 👈 check server logs
    const { name, email, role, password } = req.body;

    const newEmployee = new Employee({ name, email, role, password });
    await newEmployee.save();

    res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
