const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/skills
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// POST /api/skills
router.post("/", async (req, res) => {
  try {
    const { skill_name } = req.body;
    const result = await pool.query(
      "INSERT INTO skills(skill_name) VALUES($1) RETURNING *",
      [skill_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;