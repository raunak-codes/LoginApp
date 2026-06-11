const pool = require("../config/db");

const leaveRepository = {
  findTypes: async () => {
    const result = await pool.query("SELECT * FROM leave_types");
    return result.rows;
  },

  createApplication: async ({ employee_id, leave_type_id, from_date, to_date, total_days, reason }) => {
    const query = `
      INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, total_days, reason, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      employee_id,
      leave_type_id,
      from_date,
      to_date,
      total_days,
      reason,
    ]);
    return result.rows[0];
  },

  findByEmployee: async (employee_id) => {
    const query = `
      SELECT la.*, lt.leave_name
      FROM leave_applications la
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.employee_id = $1
      ORDER BY la.created_at DESC
    `;
    const result = await pool.query(query, [employee_id]);
    return result.rows;
  },

  findPending: async () => {
    const query = `
      SELECT la.*, lt.leave_name, u.name AS employee_name
      FROM leave_applications la
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      INNER JOIN users u ON la.employee_id = u.id
      WHERE la.status = 'pending'
      ORDER BY la.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  findById: async (id) => {
    const query = `
      SELECT la.*, lt.leave_name, u.email AS employee_email, u.name AS employee_name
      FROM leave_applications la
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      INNER JOIN users u ON la.employee_id = u.id
      WHERE la.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  approve: async (id, approved_by, remarks) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update leave status
      const updateLeave = await client.query(
        "UPDATE leave_applications SET status = 'approved' WHERE id = $1 RETURNING *",
        [id]
      );
      const leave = updateLeave.rows[0];

      // Deduct from leave balance
      await client.query(
        `UPDATE leave_balance 
         SET available_days = available_days - $1
         WHERE employee_id = $2 AND leave_type_id = $3`,
        [leave.total_days, leave.employee_id, leave.leave_type_id]
      );

      // Insert approval history
      await client.query(
        `INSERT INTO approval_history (leave_id, approved_by, action, remarks, created_at)
         VALUES ($1, $2, 'approved', $3, NOW())`,
        [id, approved_by, remarks]
      );

      await client.query("COMMIT");
      return leave;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  reject: async (id, rejected_by, remarks) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update leave status
      const updateLeave = await client.query(
        "UPDATE leave_applications SET status = 'rejected' WHERE id = $1 RETURNING *",
        [id]
      );
      const leave = updateLeave.rows[0];

      // Insert approval history
      await client.query(
        `INSERT INTO approval_history (leave_id, approved_by, action, remarks, created_at)
         VALUES ($1, $2, 'rejected', $3, NOW())`,
        [id, rejected_by, remarks]
      );

      await client.query("COMMIT");
      return leave;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = leaveRepository;
