const Joi = require("joi");

const applyLeaveSchema = Joi.object({
  leave_type_id: Joi.number().integer().positive().required(),
  from_date: Joi.date().iso().required(),
  to_date: Joi.date().iso().min(Joi.ref("from_date")).required().messages({
    "date.min": '"to_date" must be greater than or equal to "from_date"',
  }),
  reason: Joi.string().max(500).optional().allow(""),
});

const approveLeaveSchema = Joi.object({
  remarks: Joi.string().max(500).optional().allow(""),
});

const rejectLeaveSchema = Joi.object({
  remarks: Joi.string().max(500).optional().allow(""),
});

module.exports = {
  applyLeaveSchema,
  approveLeaveSchema,
  rejectLeaveSchema,
};
