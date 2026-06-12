const { Pool } = require("pg");
const config = require("./env");

const poolConfig = {
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: parseInt(config.DB_PORT),
};

if (config.NODE_ENV === "production") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = pool;
