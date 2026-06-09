const logger = require("../utils/logger");

/**
 * Centralized error handler middleware.
 * Catches all errors thrown in route handlers or next(err) calls.
 */
function errorHandler(err, req, res, next) {
  logger.error(err.message || "Unexpected error", err);

  // Joi validation errors
  if (err.isJoi || err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.details ? err.details.map((d) => d.message) : err.message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // PostgreSQL errors
  if (err.code === "23505") {
    return res.status(409).json({ error: "Duplicate entry — record already exists" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Foreign key violation — referenced record not found" });
  }

  // Default server error
  return res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;
