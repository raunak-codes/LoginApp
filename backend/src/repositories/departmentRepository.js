const pool = require("../config/db");

const departmentRepository = {
  findAll: async () => {
    const result = await pool.query("SELECT * FROM departments ORDER BY id ASC");
    return result.rows;
  },

  create: async (name) => {
    const result = await pool.query(
      "INSERT INTO departments (department_name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0];
  },
};

module.exports = departmentRepository;
