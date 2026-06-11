const { ForbiddenError } = require("../utils/errors");

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Access denied — insufficient permissions"));
    }
    next();
  };
}

module.exports = authorize;
