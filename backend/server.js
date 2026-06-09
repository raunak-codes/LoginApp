require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("./src/utils/logger");
const errorHandler = require("./src/middleware/errorHandler");

// ── Existing routes ─────────────────────────────────────────
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const departmentRoutes = require("./routes/departments");
const skillRoutes = require("./routes/skills");
const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leave");

// ── New enterprise routes ────────────────────────────────────
const assetRoutes = require("./src/routes/assets");
const notificationRoutes = require("./src/routes/notifications");
const auditLogRoutes = require("./src/routes/auditLogs");
const searchRoutes = require("./src/routes/search");
const dashboardRoutes = require("./src/routes/dashboard");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Request logger ───────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ── Existing API routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leave", leaveRoutes);

// ── New enterprise API routes ────────────────────────────────
app.use("/api/assets", assetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── Centralized error handler (must be last) ─────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 PeopleDesk ERP server running on port ${PORT}`);
});