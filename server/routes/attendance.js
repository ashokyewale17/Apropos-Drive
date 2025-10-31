const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

router.get("/report/:month/:year", async (req, res) => {
  const { month, year } = req.params;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const report = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate("employeeId", "name email");

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Error fetching attendance report" });
  }
});

module.exports = router;
