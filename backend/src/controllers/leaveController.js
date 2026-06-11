const leaveService = require("../services/leaveService");
const { applyLeaveSchema, approveLeaveSchema, rejectLeaveSchema } = require("../validators/leaveValidator");

const leaveController = {
  listTypes: async (req, res, next) => {
    try {
      const types = await leaveService.listTypes();
      res.json(types);
    } catch (err) {
      next(err);
    }
  },

  applyLeave: async (req, res, next) => {
    try {
      const { error, value } = applyLeaveSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      const result = await leaveService.applyLeave({
        ...value,
        employee_id: req.user.id,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  listMyLeaves: async (req, res, next) => {
    try {
      const result = await leaveService.listMyLeaves(req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  listPendingLeaves: async (req, res, next) => {
    try {
      const result = await leaveService.listPendingLeaves();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  approveLeave: async (req, res, next) => {
    try {
      const { error, value } = approveLeaveSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      await leaveService.approveLeave(req.params.id, req.user.id, value.remarks);
      res.json({ message: "Leave approved" });
    } catch (err) {
      next(err);
    }
  },

  rejectLeave: async (req, res, next) => {
    try {
      const { error, value } = rejectLeaveSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      await leaveService.rejectLeave(req.params.id, req.user.id, value.remarks);
      res.json({ message: "Leave rejected" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = leaveController;
