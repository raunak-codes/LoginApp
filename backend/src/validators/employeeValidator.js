const Joi = require("joi");

const createEmployeeSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  department_id: Joi.number().integer().positive().required(),
  phone: Joi.string().min(7).max(20).required(),
  address: Joi.string().max(500).optional(),
  designation: Joi.string().min(2).max(100).required(),
  salary: Joi.number().min(0).required(),
  skill_ids: Joi.array().items(Joi.number().integer().positive()).optional(),
});

const updateEmployeeSchema = Joi.object({
  department_id: Joi.number().integer().positive().optional(),
  phone: Joi.string().min(7).max(20).optional(),
  address: Joi.string().max(500).optional(),
  designation: Joi.string().min(2).max(100).optional(),
  salary: Joi.number().min(0).optional(),
});

module.exports = { createEmployeeSchema, updateEmployeeSchema };
