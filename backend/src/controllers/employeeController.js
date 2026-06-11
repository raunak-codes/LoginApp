const employeeService = require("../services/employeeService");
const { createEmployeeSchema, updateEmployeeSchema } = require("../validators/employeeValidator");

const employeeController = {
  listEmployees: async (req, res, next) => {
    try {
      const result = await employeeService.listEmployees(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getEmployee: async (req, res, next) => {
    try {
      const employee = await employeeService.getEmployee(req.params.id);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  },

  createEmployee: async (req, res, next) => {
    try {
      const { error, value } = createEmployeeSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      const employee = await employeeService.createEmployee(value);
      res.status(201).json(employee);
    } catch (err) {
      next(err);
    }
  },

  updateEmployee: async (req, res, next) => {
    try {
      const { error, value } = updateEmployeeSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      const employee = await employeeService.updateEmployee(req.params.id, value);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  },

  deleteEmployee: async (req, res, next) => {
    try {
      await employeeService.deleteEmployee(req.params.id);
      res.json({ message: "Employee deleted" });
    } catch (err) {
      next(err);
    }
  },

  uploadImages: async (req, res, next) => {
    try {
      const { employee_id } = req.body;
      if (!employee_id) {
        return res.status(400).json({ error: "employee_id is required" });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const imageUrls = req.files.map((file) => file.filename);
      await employeeService.uploadImages(employee_id, imageUrls);

      res.json({ message: "Images uploaded", files: imageUrls });
    } catch (err) {
      next(err);
    }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await employeeService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = employeeController;
