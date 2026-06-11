const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const employeeRepository = require("../../repositories/employeeRepository");

// GET /api/v2/employees — returns employees with a modernized schema structure
router.get("/", auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { department_id, search, sortBy, sortOrder } = req.query;

    const result = await employeeRepository.findAll({
      page,
      limit,
      department_id,
      search,
      sortBy,
      sortOrder,
    });

    // Transform for V2 schema mapping (modernized nested contact and work structures)
    const transformed = result.data.map((emp) => ({
      employee_id: emp.id,
      full_name: emp.name,
      contact: {
        email: emp.email,
        phone: emp.phone,
        address: emp.address,
      },
      career: {
        department: emp.department_name,
        designation: emp.designation,
        salary: parseFloat(emp.salary),
        joined_at: emp.joined_at,
      },
    }));

    res.json({
      api_version: "v2",
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.totalPages,
      },
      employees: transformed,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
