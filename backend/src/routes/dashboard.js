const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const pool = require("../../config/db");

// GET /api/dashboard/stats — comprehensive dashboard statistics
router.get("/stats", auth, async (req, res, next) => {
  try {
    const [
      employees,
      departments,
      skills,
      assets,
      allocatedAssets,
      pendingLeaves,
      approvedLeaves,
      deptCount,
      monthlyHiring,
      assetStatusBreakdown,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM employee_profiles"),
      pool.query("SELECT COUNT(*) FROM departments"),
      pool.query("SELECT COUNT(*) FROM skills"),
      pool.query("SELECT COUNT(*) FROM assets"),
      pool.query("SELECT COUNT(*) FROM assets WHERE status = 'available'"),
      pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM leave_applications WHERE status = 'approved'"),
      pool.query("SELECT * FROM dept_employee_count ORDER BY employee_count DESC"),
      pool.query(`
        SELECT TO_CHAR(created_at, 'Mon YYYY') AS month,
               TO_CHAR(created_at, 'YYYY-MM') AS sort_key,
               COUNT(*) AS new_hires
        FROM employee_profiles
        GROUP BY TO_CHAR(created_at, 'Mon YYYY'), TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY sort_key DESC
        LIMIT 12
      `),
      pool.query(`
        SELECT status, COUNT(*) AS count
        FROM assets
        GROUP BY status
      `),
    ]);

    res.json({
      total_employees: parseInt(employees.rows[0].count),
      total_departments: parseInt(departments.rows[0].count),
      total_skills: parseInt(skills.rows[0].count),
      total_assets: parseInt(assets.rows[0].count),
      available_assets: parseInt(allocatedAssets.rows[0].count),
      pending_leaves: parseInt(pendingLeaves.rows[0].count),
      approved_leaves: parseInt(approvedLeaves.rows[0].count),
      dept_employee_count: deptCount.rows,
      monthly_hiring: monthlyHiring.rows.reverse(),
      asset_status_breakdown: assetStatusBreakdown.rows,
    });
  } catch (err) { next(err); }
});

// GET /api/dashboard/reports/employees — all employees for export
router.get("/reports/employees", auth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT u.name, u.email, u.role, d.department_name, ep.designation, ep.salary, ep.phone, ep.created_at
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      JOIN departments d ON ep.department_id = d.id
      ORDER BY ep.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/dashboard/reports/leaves — all leaves for export
router.get("/reports/leaves", auth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT u.name AS employee_name, lt.leave_name, la.from_date, la.to_date,
             la.total_days, la.reason, la.status, la.created_at
      FROM leave_applications la
      JOIN users u ON la.employee_id = u.id
      JOIN leave_types lt ON la.leave_type_id = lt.id
      ORDER BY la.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/dashboard/reports/assets — all assets for export
router.get("/reports/assets", auth, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT a.asset_code, a.asset_name, a.asset_type, a.purchase_date,
             a.purchase_cost, a.status,
             u.name AS assigned_to
      FROM assets a
      LEFT JOIN asset_allocations aa ON aa.asset_id = a.id AND aa.status = 'active'
      LEFT JOIN users u ON aa.employee_id = u.id
      ORDER BY a.id DESC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
