const winston = require("winston");
const path = require("path");

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, details }) => {
  const detailStr = details ? ` | Details: ${JSON.stringify(details)}` : "";
  return `${timestamp} [${level}]: ${stack || message}${detailStr}`;
});

// Helper filters for Winston logging categories
const loginFilter = winston.format((info) => {
  return info.category === "login" ? info : false;
})();

const securityFilter = winston.format((info) => {
  return info.category === "security" ? info : false;
})();

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), logFormat),
    }),
    // Error file transport
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    // Combined file transport
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
    // Login logs transport
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/login.log"),
      format: combine(loginFilter, logFormat),
    }),
    // Security logs transport
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/security.log"),
      format: combine(securityFilter, logFormat),
    }),
  ],
});

// Helper wrappers
logger.logLogin = (username, success, ip, extra = {}) => {
  logger.info(`Login attempted: User "${username}" -> ${success ? "SUCCESS" : "FAILED"} (IP: ${ip})`, {
    category: "login",
    details: extra,
  });
};

logger.logSecurity = (message, details = {}) => {
  logger.warn(`Security Event: ${message}`, {
    category: "security",
    details,
  });
};

module.exports = logger;
