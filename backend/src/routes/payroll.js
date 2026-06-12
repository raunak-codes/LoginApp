const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const payrollController = require("../controllers/payrollController");

// GET /api/payroll/employees — List all employees (Admin/HR only)
router.get("/employees", auth, authorize("admin", "hr"), payrollController.listEmployeesWithSalary);

// GET /api/payroll/employees/:employee_id — Get salary details (Admin/HR/Self)
router.get("/employees/:employee_id", auth, payrollController.getSalaryDetail);

// POST /api/payroll/employees/:employee_id — Update salary components (Admin/HR only)
router.post("/employees/:employee_id", auth, authorize("admin", "hr"), payrollController.updateSalary);

// GET /api/payroll/my-salary — Get logged-in user's salary card details
router.get("/my-salary", auth, payrollController.getMySalary);

module.exports = router;
