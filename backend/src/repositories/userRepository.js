const pool = require("../config/db");

const userRepository = {
  findByEmail: async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query(
      "SELECT id, name, email, role, verified FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  create: async ({ name, email, password, role }) => {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role`,
      [name, email, password, role]
    );
    return result.rows[0];
  },

  findAll: async () => {
    const result = await pool.query(
      "SELECT id, name, email, role, verified FROM users ORDER BY id ASC"
    );
    return result.rows;
  },

  updateRole: async (id, role) => {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, verified",
      [role, id]
    );
    return result.rows[0];
  },
};

module.exports = userRepository;
