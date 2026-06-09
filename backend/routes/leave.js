const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/auth");

// GET /api/leave/types
router.get("/types", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leave_types");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// POST /api/leave/apply
router.post("/apply", auth, async (req, res) => {
  try {
    const { leave_type_id, from_date, to_date, reason } = req.body;

    const from = new Date(from_date);
    const to = new Date(to_date);
    const total_days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const result = await pool.query(
      `INSERT INTO leave_applications(employee_id, leave_type_id, from_date, to_date, total_days, reason, status, created_at)
       VALUES($1, $2, $3, $4, $5, $6, 'pending', NOW()) RETURNING *`,
      [req.user.id, leave_type_id, from_date, to_date, total_days, reason]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET /api/leave/my — logged in user's leaves
router.get("/my", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.*, lt.leave_name
       FROM leave_applications la
       INNER JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = $1
       ORDER BY la.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET /api/leave/pending — for manager/hr/admin
router.get("/pending", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.*, lt.leave_name, u.name AS employee_name
       FROM leave_applications la
       INNER JOIN leave_types lt ON la.leave_type_id = lt.id
       INNER JOIN users u ON la.employee_id = u.id
       WHERE la.status = 'pending'
       ORDER BY la.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// POST /api/leave/:id/approve
router.post("/:id/approve", auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { remarks } = req.body;
    const { id } = req.params;

    // Update leave status
    const leave = await client.query(
      "UPDATE leave_applications SET status='approved' WHERE id=$1 RETURNING *",
      [id]
    );

    // Deduct from leave balance
    await client.query(
      `UPDATE leave_balance SET available_days = available_days - $1
       WHERE employee_id=$2 AND leave_type_id=$3`,
      [leave.rows[0].total_days, leave.rows[0].employee_id, leave.rows[0].leave_type_id]
    );

    // Insert audit log
    await client.query(
      `INSERT INTO approval_history(leave_id, approved_by, action, remarks, created_at)
       VALUES($1, $2, 'approved', $3, NOW())`,
      [id, req.user.id, remarks]
    );

    await client.query("COMMIT");
    res.json({ message: "Leave approved" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json(error.message);
  } finally {
    client.release();
  }
});

// POST /api/leave/:id/reject
router.post("/:id/reject", auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { remarks } = req.body;
    const { id } = req.params;

    await client.query(
      "UPDATE leave_applications SET status='rejected' WHERE id=$1",
      [id]
    );

    await client.query(
      `INSERT INTO approval_history(leave_id, approved_by, action, remarks, created_at)
       VALUES($1, $2, 'rejected', $3, NOW())`,
      [id, req.user.id, remarks]
    );

    await client.query("COMMIT");
    res.json({ message: "Leave rejected" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json(error.message);
  } finally {
    client.release();
  }
});

module.exports = router;