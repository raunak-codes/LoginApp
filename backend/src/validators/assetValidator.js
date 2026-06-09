const Joi = require("joi");

const createAssetSchema = Joi.object({
  asset_code: Joi.string().max(50).required(),
  asset_name: Joi.string().min(2).max(200).required(),
  asset_type: Joi.string().max(100).required(),
  purchase_date: Joi.date().iso().optional().allow("", null),
  purchase_cost: Joi.number().min(0).optional().allow("", null),
  status: Joi.string()
    .valid("available", "allocated", "returned", "damaged", "lost")
    .default("available"),
});

const updateAssetSchema = Joi.object({
  asset_name: Joi.string().min(2).max(200).optional().allow(""),
  asset_type: Joi.string().max(100).optional().allow(""),
  purchase_date: Joi.date().iso().optional().allow("", null),
  purchase_cost: Joi.number().min(0).optional().allow("", null),
  status: Joi.string()
    .valid("available", "allocated", "returned", "damaged", "lost")
    .optional(),
});

const allocateAssetSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required(),
  remarks: Joi.string().max(500).optional().allow(""),
});

const returnAssetSchema = Joi.object({
  remarks: Joi.string().max(500).optional().allow(""),
});

module.exports = {
  createAssetSchema,
  updateAssetSchema,
  allocateAssetSchema,
  returnAssetSchema,
};

