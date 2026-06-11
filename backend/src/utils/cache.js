const NodeCache = require("node-cache");
const logger = require("./logger");

// stdTTL: 3600 seconds (1 hour)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

module.exports = {
  get: (key) => {
    const val = cache.get(key);
    if (val !== undefined) {
      logger.info(`Cache HIT for key: "${key}"`);
      return val;
    }
    logger.info(`Cache MISS for key: "${key}"`);
    return null;
  },

  set: (key, value, ttl = 3600) => {
    logger.info(`Cache SET for key: "${key}" with TTL: ${ttl}s`);
    return cache.set(key, value, ttl);
  },

  del: (key) => {
    logger.info(`Cache DELETE for key: "${key}"`);
    return cache.del(key);
  },

  flush: () => {
    logger.info("Cache FLUSHED all keys");
    return cache.flushAll();
  },
};
