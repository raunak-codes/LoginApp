const pool = require("../config/db");

const auditRepository = {
  log: async ({ table_name, action_type, record_id, old_data, new_data, performed_by }) => {
    await pool.query(
      `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, new_data, performed_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [table_name, action_type, record_id, 
       old_data ? JSON.stringify(old_data) : null,
       new_data ? JSON.stringify(new_data) : null,
       performed_by]
    );
  },

  findAll: async ({ page = 1, limit = 20, table_name, action_type }) => {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (table_name) { conditions.push(`al.table_name = $${idx++}`); params.push(table_name); }
    if (action_type) { conditions.push(`al.action_type = $${idx++}`); params.push(action_type); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs al ${where}`, params
    );

    const result = await pool.query(
      `SELECT al.*, u.name AS performed_by_name
       FROM audit_logs al
       LEFT JOIN users u ON al.performed_by = u.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    };
  },
};

module.exports = auditRepository;
