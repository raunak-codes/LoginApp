const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const expenseController = require("../controllers/expenseController");

// POST /api/expenses/claim — Submit reimbursement claim
router.post("/claim", auth, expenseController.submitClaim);

// GET /api/expenses/my — View own claims history
router.get("/my", auth, expenseController.getMyClaims);

// GET /api/expenses/pending — List all pending claims (Admin/HR/Manager only)
router.get("/pending", auth, authorize("admin", "hr", "manager"), expenseController.listPendingClaims);

// POST /api/expenses/:id/approve — Approve a claim (Admin/HR/Manager only)
router.post("/:id/approve", auth, authorize("admin", "hr", "manager"), expenseController.approveClaim);

// POST /api/expenses/:id/reject — Reject a claim (Admin/HR/Manager only)
router.post("/:id/reject", auth, authorize("admin", "hr", "manager"), expenseController.rejectClaim);

module.exports = router;
