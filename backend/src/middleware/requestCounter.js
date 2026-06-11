let totalRequests = 0;
let failedLogins = 0;

function requestCounter(req, res, next) {
  totalRequests++;
  next();
}

function incrementFailedLogins() {
  failedLogins++;
}

function getStats() {
  return {
    totalRequests,
    failedLogins,
  };
}

module.exports = {
  requestCounter,
  incrementFailedLogins,
  getStats,
};
