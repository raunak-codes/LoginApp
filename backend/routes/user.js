const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/auth");

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id=$1",
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
