const pool = require("../config/db");
const logger = require("../utils/logger");

const expenseController = {
  // Submit an expense claim (Employee)
  submitClaim: async (req, res, next) => {
    try {
      const employeeId = req.user.id;
      const { title, amount, category, description, receipt_url } = req.body;

      if (!title || !amount || !category) {
        return res.status(400).json({ message: "Title, Amount, and Category are required." });
      }

      const result = await pool.query(
        `INSERT INTO expense_claims (employee_id, title, amount, category, description, receipt_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [employeeId, title, parseFloat(amount), category, description, receipt_url]
      );

      logger.info(`Expense claim submitted by user ${employeeId} for ₹${amount}`);
      res.status(201).json({ message: "Expense claim submitted successfully.", data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },

  // Get own claims (Employee)
  getMyClaims: async (req, res, next) => {
    try {
      const employeeId = req.user.id;

      const result = await pool.query(
        `SELECT * FROM expense_claims 
         WHERE employee_id = $1 
         ORDER BY created_at DESC`,
        [employeeId]
      );

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // List all pending claims (Admin/HR/Manager only)
  listPendingClaims: async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT ec.*, u.name, u.email, ep.designation
         FROM expense_claims ec
         JOIN users u ON ec.employee_id = u.id
         LEFT JOIN employee_profiles ep ON u.id = ep.user_id
         WHERE ec.status = 'pending'
         ORDER BY ec.created_at ASC`
      );

      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // Approve a claim
  approveClaim: async (req, res, next) => {
    try {
      const claimId = parseInt(req.params.id);

      // Find claim
      const claimCheck = await pool.query(
        "SELECT * FROM expense_claims WHERE id = $1",
        [claimId]
      );

      if (claimCheck.rows.length === 0) {
        return res.status(404).json({ message: "Expense claim not found." });
      }

      const claim = claimCheck.rows[0];

      if (claim.status !== "pending") {
        return res.status(400).json({ message: `Claim is already ${claim.status}.` });
      }

      // Update status
      const result = await pool.query(
        "UPDATE expense_claims SET status = 'approved' WHERE id = $1 RETURNING *",
        [claimId]
      );

      // Notify employee
      await pool.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, $2, $3)`,
        [
          claim.employee_id,
          "Expense Claim Approved",
          `Your expense claim for "${claim.title}" of ₹${parseFloat(claim.amount).toLocaleString()} has been approved.`
        ]
      );

      logger.info(`Expense claim ${claimId} approved by user ${req.user.id}`);
      res.json({ message: "Expense claim approved.", data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },

  // Reject a claim
  rejectClaim: async (req, res, next) => {
    try {
      const claimId = parseInt(req.params.id);

      // Find claim
      const claimCheck = await pool.query(
        "SELECT * FROM expense_claims WHERE id = $1",
        [claimId]
      );

      if (claimCheck.rows.length === 0) {
        return res.status(404).json({ message: "Expense claim not found." });
      }

      const claim = claimCheck.rows[0];

      if (claim.status !== "pending") {
        return res.status(400).json({ message: `Claim is already ${claim.status}.` });
      }

      // Update status
      const result = await pool.query(
        "UPDATE expense_claims SET status = 'rejected' WHERE id = $1 RETURNING *",
        [claimId]
      );

      // Notify employee
      await pool.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, $2, $3)`,
        [
          claim.employee_id,
          "Expense Claim Rejected",
          `Your expense claim for "${claim.title}" of ₹${parseFloat(claim.amount).toLocaleString()} has been rejected.`
        ]
      );

      logger.info(`Expense claim ${claimId} rejected by user ${req.user.id}`);
      res.json({ message: "Expense claim rejected.", data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = expenseController;
