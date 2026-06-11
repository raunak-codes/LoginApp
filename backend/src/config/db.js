const { Pool } = require("pg");
const config = require("./env");

const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: parseInt(config.DB_PORT),
});

module.exports = pool;
