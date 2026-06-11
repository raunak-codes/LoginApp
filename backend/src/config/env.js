const dotenv = require("dotenv");
const path = require("path");

const env = process.env.NODE_ENV || "development";
const envPath = path.resolve(__dirname, `../../../.env.${env}`);

// Load environment-specific configuration
dotenv.config({ path: envPath });

// Fallback to standard .env at the root of the backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  NODE_ENV: env,
  PORT: process.env.PORT || 5000,
  DB_USER: process.env.DB_USER || "postgres",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_NAME: process.env.DB_NAME || "loginapp",
  DB_PASSWORD: process.env.DB_PASSWORD || "yourpassword",
  DB_PORT: process.env.DB_PORT || 5432,
  JWT_SECRET: process.env.JWT_SECRET || "mysecretkey",
};
