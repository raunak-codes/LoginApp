const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const employeeController = require("../controllers/employeeController");
const upload = require("../middleware/upload");

// GET /api/employees/stats/count — dashboard stats
router.get("/stats/count", auth, employeeController.getStats);

// GET /api/employees — all employees with pagination + search + sort + filter
router.get("/", auth, employeeController.listEmployees);

// GET /api/employees/:id — get employee details with skills & images
router.get("/:id", auth, employeeController.getEmployee);

// POST /api/employees — create employee profile
router.post("/", auth, employeeController.createEmployee);

// PUT /api/employees/:id — update employee
router.put("/:id", auth, employeeController.updateEmployee);

// DELETE /api/employees/:id — delete employee
router.delete("/:id", auth, employeeController.deleteEmployee);

// POST /api/employees/upload — upload up to 5 images
router.post("/upload", auth, upload.array("images", 5), employeeController.uploadImages);

module.exports = router;
