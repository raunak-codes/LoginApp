const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const pool = require("../config/db");

// Protect all dashboard routes
router.use(auth);
router.use(authorize("admin", "hr", "manager"));

// GET /api/dashboard/stats — comprehensive dashboard statistics
router.get("/stats", async (req, res, next) => {
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
      deptSalary,
      attendanceStatus,
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
        SELECT d.department_name,
               COALESCE(SUM(s.basic + s.hra + s.lta + s.allowances), 0) AS total_salary
        FROM departments d
        LEFT JOIN employee_profiles ep ON ep.department_id = d.id
        LEFT JOIN salaries s ON s.employee_id = ep.user_id
        GROUP BY d.department_name
        ORDER BY total_salary DESC
      `),
      pool.query(`
        SELECT status, COUNT(*) AS count
        FROM attendance
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
      dept_salary_distribution: deptSalary.rows.map(r => ({
        department_name: r.department_name,
        total_salary: parseFloat(r.total_salary)
      })),
      attendance_status_breakdown: attendanceStatus.rows.map(r => ({
        status: r.status,
        count: parseInt(r.count)
      })),
    });
  } catch (err) { next(err); }
});

// GET /api/dashboard/reports/employees — all employees for export
router.get("/reports/employees", async (req, res, next) => {
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
router.get("/reports/leaves", async (req, res, next) => {
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
router.get("/reports/assets", async (req, res, next) => {
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

// GET /api/dashboard/reports/payroll — payroll ledger for export
router.get("/reports/payroll", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.name AS employee_name,
        u.email,
        d.department_name,
        ep.designation,
        s.basic,
        s.hra,
        s.lta,
        s.allowances,
        (s.basic + s.hra + s.lta + s.allowances) AS gross_salary,
        s.pf,
        s.tds,
        s.pt,
        ((s.basic + s.hra + s.lta + s.allowances) - (s.pf + s.tds + s.pt)) AS net_salary,
        (s.basic + s.hra + s.lta + s.allowances + s.employer_pf + s.gratuity) AS ctc
      FROM salaries s
      JOIN users u ON s.employee_id = u.id
      JOIN employee_profiles ep ON ep.user_id = u.id
      JOIN departments d ON ep.department_id = d.id
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/dashboard/reports/attendance — attendance summary for export
router.get("/reports/attendance", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.name AS employee_name,
        u.email,
        d.department_name,
        COUNT(a.id) AS total_days,
        COUNT(CASE WHEN a.status = 'present' AND a.is_late = FALSE THEN 1 END) AS present_on_time,
        COUNT(CASE WHEN a.status = 'late' OR a.is_late = TRUE THEN 1 END) AS present_late,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent,
        ROUND(AVG(CASE WHEN a.check_out IS NOT NULL THEN EXTRACT(EPOCH FROM (a.check_out - a.check_in))/3600.0 ELSE 0 END)::numeric, 2) AS avg_hours
      FROM attendance a
      JOIN users u ON a.employee_id = u.id
      JOIN employee_profiles ep ON ep.user_id = u.id
      JOIN departments d ON ep.department_id = d.id
      GROUP BY u.name, u.email, d.department_name
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
