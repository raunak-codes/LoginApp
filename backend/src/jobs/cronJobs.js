const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const logger = require("../utils/logger");

// 1. Daily Leave Report: Runs every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const leavesResult = await pool.query(
      `SELECT la.*, u.name AS employee_name, lt.leave_name
       FROM leave_applications la
       INNER JOIN users u ON la.employee_id = u.id
       INNER JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.status = 'approved' AND (la.from_date <= $1 AND la.to_date >= $1)`,
      [today]
    );

    logger.info(`[CRON] Daily Leave Report: Found ${leavesResult.rows.length} employee(s) on active leave today (${today}).`);
    leavesResult.rows.forEach((leave) => {
      logger.info(`  - ${leave.employee_name} is on ${leave.leave_name} (${leave.total_days} day(s))`);
    });
  } catch (err) {
    logger.error(`[CRON ERROR] Daily Leave Report failed: ${err.message}`, err);
  }
});

// 2. Daily Database Backup: Runs every day at midnight (12:00 AM)
cron.schedule("0 0 * * *", async () => {
  try {
    const backupDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `simulated_backup_${timestamp}.sql`);

    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const employeesCount = await pool.query("SELECT COUNT(*) FROM employee_profiles");

    const sqlContent = `-- PeopleDesk ERP Database Backup
-- Timestamp: ${new Date().toISOString()}
-- Total Users: ${usersCount.rows[0].count}
-- Total Employees: ${employeesCount.rows[0].count}
-- Simulated Database backup completes successfully.
`;

    fs.writeFileSync(backupPath, sqlContent, "utf8");
    logger.info(`[CRON] Database backup saved to ${backupPath}`);
  } catch (err) {
    logger.error(`[CRON ERROR] Database backup failed: ${err.message}`, err);
  }
});

// 3. Notification Cleanup: Runs every day at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  try {
    const result = await pool.query(
      `DELETE FROM notifications 
       WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '30 days'`
    );
    logger.info(`[CRON] Notification Cleanup: Removed ${result.rowCount} read notifications older than 30 days.`);
  } catch (err) {
    logger.error(`[CRON ERROR] Notification cleanup failed: ${err.message}`, err);
  }
});

logger.info("⏰ Background cron jobs successfully initialized");
