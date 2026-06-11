const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid("admin", "hr", "manager", "employee", "user").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  password: Joi.string().required(),
});

module.exports = {
  signupSchema,
  loginSchema,
};
