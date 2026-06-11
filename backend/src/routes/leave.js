const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const leaveController = require("../controllers/leaveController");

// GET /api/leave/types
router.get("/types", auth, leaveController.listTypes);

// POST /api/leave/apply
router.post("/apply", auth, leaveController.applyLeave);

// GET /api/leave/my — logged in user's leaves
router.get("/my", auth, leaveController.listMyLeaves);

// GET /api/leave/pending — for manager/hr/admin
router.get("/pending", auth, leaveController.listPendingLeaves);

// POST /api/leave/:id/approve
router.post("/:id/approve", auth, leaveController.approveLeave);

// POST /api/leave/:id/reject
router.post("/:id/reject", auth, leaveController.rejectLeave);

module.exports = router;
