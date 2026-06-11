const logger = require("../utils/logger");

/**
 * Centralized error handler middleware.
 * Catches all errors thrown in route handlers or next(err) calls.
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(err.message || "Unexpected error", { stack: err.stack });

  // Joi validation errors
  if (err.isJoi) {
    return res.status(422).json({
      error: "Validation Error",
      details: err.details ? err.details.map((d) => d.message) : err.message,
    });
  }

  // Custom AppError instances (like ValidationError, NotFoundError, etc.)
  if (err.status) {
    return res.status(err.status).json({
      error: err.name,
      message: err.message,
      details: err.details || undefined,
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
  return res.status(500).json({
    error: "InternalServerError",
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;

