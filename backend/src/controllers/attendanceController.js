const pool = require("../config/db");
const logger = require("../utils/logger");

const attendanceController = {
  // Clock-in handler
  checkIn: async (req, res, next) => {
    try {
      const employeeId = req.user.id;
      const now = new Date();

      // Check if already checked in today
      const todayCheck = await pool.query(
        "SELECT * FROM attendance WHERE employee_id = $1 AND created_at = CURRENT_DATE",
        [employeeId]
      );

      if (todayCheck.rows.length > 0) {
        return res.status(400).json({ message: "Already checked in today." });
      }

      // Check if late (after 09:15 AM)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = (hours > 9) || (hours === 9 && minutes > 15);

      let status = "present";

      if (isLate) {
        // Count number of late entries in the current calendar month
        const lateCountCheck = await pool.query(
          `SELECT COUNT(*) FROM attendance 
           WHERE employee_id = $1 
             AND is_late = TRUE 
             AND DATE_TRUNC('month', check_in) = DATE_TRUNC('month', CURRENT_DATE)`,
          [employeeId]
        );
        
        const count = parseInt(lateCountCheck.rows[0].count);

        // If this is the 3rd, 6th, 9th, etc., late check-in in the current month
        if ((count + 1) % 3 === 0) {
          status = "absent";
        } else {
          status = "late";
        }
      }

      const result = await pool.query(
        `INSERT INTO attendance (employee_id, check_in, status, is_late, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)
         RETURNING *`,
        [employeeId, now, status, isLate]
      );

      logger.info(`Attendance Clock-In recorded for user ${employeeId} - Status: ${status}`);
      res.status(201).json({ message: "Checked in successfully.", data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },

  // Clock-out handler
  checkOut: async (req, res, next) => {
    try {
      const employeeId = req.user.id;
      const now = new Date();

      // Find today's check-in
      const todayCheck = await pool.query(
        "SELECT * FROM attendance WHERE employee_id = $1 AND created_at = CURRENT_DATE",
        [employeeId]
      );

      if (todayCheck.rows.length === 0) {
        return res.status(400).json({ message: "Please check in first." });
      }

      const attendanceRecord = todayCheck.rows[0];

      if (attendanceRecord.check_out) {
        return res.status(400).json({ message: "Already checked out today." });
      }

      const result = await pool.query(
        `UPDATE attendance 
         SET check_out = $1 
         WHERE id = $2 
         RETURNING *`,
        [now, attendanceRecord.id]
      );

      logger.info(`Attendance Clock-Out recorded for user ${employeeId}`);
      res.json({ message: "Checked out successfully.", data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },

  // Get logged-in employee's history
  getMyAttendance: async (req, res, next) => {
    try {
      const employeeId = req.user.id;

      const result = await pool.query(
        `SELECT id, check_in, check_out, status, is_late, created_at 
         FROM attendance 
         WHERE employee_id = $1 
         ORDER BY created_at DESC`,
        [employeeId]
      );

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Get current check-in/out status of employee today
  getTodayStatus: async (req, res, next) => {
    try {
      const employeeId = req.user.id;

      const result = await pool.query(
        "SELECT * FROM attendance WHERE employee_id = $1 AND created_at = CURRENT_DATE",
        [employeeId]
      );

      if (result.rows.length === 0) {
        return res.json({ checkedIn: false, checkInTime: null, checkOutTime: null, status: null, isLate: false });
      }

      const record = result.rows[0];
      res.json({
        checkedIn: true,
        checkInTime: record.check_in,
        checkOutTime: record.check_out,
        status: record.status,
        isLate: record.is_late
      });
    } catch (err) {
      next(err);
    }
  },

  // List all employees attendance for date (Admin/HR only)
  listAllAttendance: async (req, res, next) => {
    try {
      const date = req.query.date || new Date().toISOString().split("T")[0];

      const result = await pool.query(
        `SELECT u.id AS employee_id, u.name, u.email, u.role, ep.designation,
                a.id AS attendance_id, a.check_in, a.check_out, a.status, a.is_late
         FROM users u
         JOIN employee_profiles ep ON u.id = ep.user_id
         LEFT JOIN attendance a ON u.id = a.employee_id AND a.created_at = $1
         WHERE u.role != 'admin'
         ORDER BY u.name ASC`,
        [date]
      );

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = attendanceController;
