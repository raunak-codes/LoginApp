const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const departmentController = require("../controllers/departmentController");

router.get("/", auth, departmentController.listDepartments);
router.post("/", auth, departmentController.createDepartment);

module.exports = router;
