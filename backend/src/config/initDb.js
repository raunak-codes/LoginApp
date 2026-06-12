const fs = require("fs");
const path = require("path");
const pool = require("./db");
const logger = require("../utils/logger");

async function runMigration() {
  try {
    logger.info("Starting database migration process...");

    // 1. Path to migrations
    const migrateV1Path = path.resolve(__dirname, "../../../database/migrate_enterprise.sql");
    const migrateV2Path = path.resolve(__dirname, "../../../database/migrate_enterprise_v2.sql");
    const migrateV3Path = path.resolve(__dirname, "../../../database/migrate_enterprise_v3.sql");

    // Check files existence
    if (fs.existsSync(migrateV1Path)) {
      logger.info("Executing Migration V1 (Enterprise Schema tables & views)...");
      const sqlV1 = fs.readFileSync(migrateV1Path, "utf8");
      await pool.query(sqlV1);
      logger.info("Migration V1 completed successfully.");
    } else {
      logger.warn(`Migration V1 SQL file not found at ${migrateV1Path}`);
    }

    if (fs.existsSync(migrateV2Path)) {
      logger.info("Executing Migration V2 (Enterprise Dashboard Views & Indexes)...");
      const sqlV2 = fs.readFileSync(migrateV2Path, "utf8");
      await pool.query(sqlV2);
      logger.info("Migration V2 completed successfully.");
    } else {
      logger.warn(`Migration V2 SQL file not found at ${migrateV2Path}`);
    }

    if (fs.existsSync(migrateV3Path)) {
      logger.info("Executing Migration V3 (Attendance, Payroll & Asset Requests)...");
      const sqlV3 = fs.readFileSync(migrateV3Path, "utf8");
      await pool.query(sqlV3);
      logger.info("Migration V3 completed successfully.");
    } else {
      logger.warn(`Migration V3 SQL file not found at ${migrateV3Path}`);
    }

    logger.info("Database migration completed.");
  } catch (err) {
    logger.error(`Database migration failed: ${err.message}`, err);
    throw err;
  }
}

// Execute if run directly
if (require.main === module) {
  runMigration()
    .then(() => {
      logger.info("Migration runner exiting...");
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Migration runner crashed!");
      process.exit(1);
    });
}

module.exports = runMigration;
