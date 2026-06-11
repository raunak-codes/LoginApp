const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../utils/errors");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return next(new UnauthorizedError("Access denied — token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
