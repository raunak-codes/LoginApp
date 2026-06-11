const pool = require("../config/db");

const skillRepository = {
  findAll: async () => {
    const result = await pool.query("SELECT * FROM skills ORDER BY id ASC");
    return result.rows;
  },

  create: async (name) => {
    const result = await pool.query(
      "INSERT INTO skills (skill_name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0];
  },
};

module.exports = skillRepository;
