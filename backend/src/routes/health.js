const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const os = require("os");
const { getStats } = require("../middleware/requestCounter");

// GET /api/health — simple health check
router.get("/", (req, res) => {
  res.json({ status: "UP" });
});

// GET /api/health/details — Advanced Monitoring Dashboard Stats
router.get("/details", async (req, res) => {
  let dbStatus = "DOWN";
  let totalUsers = 0;

  try {
    const dbCheck = await pool.query("SELECT COUNT(*) FROM users");
    dbStatus = "UP";
    totalUsers = parseInt(dbCheck.rows[0].count);
  } catch (err) {
    dbStatus = "DOWN";
  }

  const { totalRequests, failedLogins } = getStats();

  res.json({
    status: dbStatus === "UP" ? "UP" : "DOWN",
    timestamp: new Date().toISOString(),
    system: {
      uptime: os.uptime(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      loadAverage: os.loadavg(),
    },
    database: {
      status: dbStatus,
      total_users: totalUsers,
    },
    metrics: {
      api_requests: totalRequests,
      failed_logins: failedLogins,
    },
  });
});

module.exports = router;
