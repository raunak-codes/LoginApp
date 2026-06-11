const departmentService = require("../services/departmentService");

const departmentController = {
  listDepartments: async (req, res, next) => {
    try {
      const departments = await departmentService.listDepartments();
      res.json(departments);
    } catch (err) {
      next(err);
    }
  },

  createDepartment: async (req, res, next) => {
    try {
      const { department_name } = req.body;
      if (!department_name || department_name.trim().length < 2) {
        return res.status(400).json({ error: "Department name must be at least 2 characters" });
      }
      const department = await departmentService.createDepartment(department_name);
      res.status(201).json(department);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = departmentController;
