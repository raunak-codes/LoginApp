const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const attendanceController = require("../controllers/attendanceController");

// POST /api/attendance/check-in — Check-in
router.post("/check-in", auth, attendanceController.checkIn);

// POST /api/attendance/check-out — Check-out
router.post("/check-out", auth, attendanceController.checkOut);

// GET /api/attendance/my — Current employee's history
router.get("/my", auth, attendanceController.getMyAttendance);

// GET /api/attendance/status — Today's clock-in status
router.get("/status", auth, attendanceController.getTodayStatus);

// GET /api/attendance/list — List all employee attendance (Admin/HR only)
router.get("/list", auth, authorize("admin", "hr"), attendanceController.listAllAttendance);

module.exports = router;
