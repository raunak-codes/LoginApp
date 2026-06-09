const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const auditRepository = require("../repositories/auditRepository");

// GET /api/audit-logs — paginated audit trail (admin only)
router.get("/", auth, async (req, res, next) => {
  try {
    const { page, limit, table_name, action_type } = req.query;
    const result = await auditRepository.findAll({ page, limit, table_name, action_type });
    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
