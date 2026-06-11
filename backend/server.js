// Load environment based config
const config = require("./src/config/env");

const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("./src/utils/logger");
const errorHandler = require("./src/middleware/errorHandler");
const { requestCounter } = require("./src/middleware/requestCounter");

// Initialize Background Cron Jobs (bypass during tests)
if (process.env.NODE_ENV !== "test") {
  require("./src/jobs/cronJobs");
}

// ── V1 API Routes ───────────────────────────────────────────
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const departmentRoutes = require("./src/routes/departments");
const skillRoutes = require("./src/routes/skills");
const employeeRoutes = require("./src/routes/employees");
const leaveRoutes = require("./src/routes/leave");
const assetRoutes = require("./src/routes/assets");
const notificationRoutes = require("./src/routes/notifications");
const auditLogRoutes = require("./src/routes/auditLogs");
const searchRoutes = require("./src/routes/search");
const dashboardRoutes = require("./src/routes/dashboard");

// ── V2 API Routes ───────────────────────────────────────────
const employeeV2Routes = require("./src/routes/v2/employees");

// ── Health Route ────────────────────────────────────────────
const healthRoutes = require("./src/routes/health");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Track metrics
app.use(requestCounter);

// Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ── API Version 1 Routes ────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/leave", leaveRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// ── API Version 2 Routes ────────────────────────────────────
app.use("/api/v2/employees", employeeV2Routes);

// ── Health API Route ────────────────────────────────────────
app.use("/api/health", healthRoutes);

// ── Backward Compatibility for /api without version ─────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── Centralized Error Handler (must be last) ─────────────────
app.use(errorHandler);

if (require.main === module) {
  const PORT = config.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`🚀 PeopleDesk ERP server running in [${config.NODE_ENV}] mode on port ${PORT}`);
  });
}

module.exports = app; // Export for unit tests