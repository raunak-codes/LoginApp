const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const pool = require("../../config/db");

// GET /api/search?q=term — global search across employees, assets, departments
router.get("/", auth, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ employees: [], assets: [], departments: [] });
    }

    const term = `%${q.trim()}%`;

    const [employees, assets, departments] = await Promise.all([
      pool.query(
        `SELECT ep.id, u.name, u.email, d.department_name, ep.designation
         FROM employee_profiles ep
         JOIN users u ON ep.user_id = u.id
         JOIN departments d ON ep.department_id = d.id
         WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR ep.designation ILIKE $1 OR d.department_name ILIKE $1
         LIMIT 10`,
        [term]
      ),
      pool.query(
        `SELECT id, asset_code, asset_name, asset_type, status
         FROM assets
         WHERE asset_name ILIKE $1 OR asset_code ILIKE $1 OR asset_type ILIKE $1
         LIMIT 10`,
        [term]
      ),
      pool.query(
        `SELECT id, department_name FROM departments WHERE department_name ILIKE $1 LIMIT 5`,
        [term]
      ),
    ]);

    res.json({
      employees: employees.rows,
      assets: assets.rows,
      departments: departments.rows,
    });
  } catch (err) { next(err); }
});

module.exports = router;
