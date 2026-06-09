const pool = require("../../config/db");

const assetRepository = {
  // Get all assets with pagination, filtering, sorting
  findAll: async ({ page = 1, limit = 10, status, asset_type, search, sortBy = "id", sortOrder = "DESC" }) => {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`a.status = $${idx++}`); params.push(status); }
    if (asset_type) { conditions.push(`a.asset_type = $${idx++}`); params.push(asset_type); }
    if (search) {
      conditions.push(`(a.asset_name ILIKE $${idx} OR a.asset_code ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSort = ["id", "asset_name", "asset_type", "purchase_cost", "status"];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : "id";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM assets a ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT a.*, 
        (SELECT u.name FROM users u 
         JOIN asset_allocations aa ON aa.employee_id = u.id 
         WHERE aa.asset_id = a.id AND aa.status = 'active' LIMIT 1) AS assigned_to
       FROM assets a
       ${where}
       ORDER BY a.${safeSort} ${safeOrder}
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

  findById: async (id) => {
    const result = await pool.query(
      `SELECT a.* FROM assets a WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  create: async ({ asset_code, asset_name, asset_type, purchase_date, purchase_cost, status }) => {
    const result = await pool.query(
      `INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [asset_code, asset_name, asset_type, purchase_date, purchase_cost, status || "available"]
    );
    return result.rows[0];
  },

  update: async (id, fields) => {
    const sets = [];
    const params = [];
    let idx = 1;
    for (const [key, val] of Object.entries(fields)) {
      sets.push(`${key} = $${idx++}`);
      params.push(val);
    }
    params.push(id);
    const result = await pool.query(
      `UPDATE assets SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query("DELETE FROM assets WHERE id = $1", [id]);
  },

  // Allocate asset to employee (transaction)
  allocate: async (asset_id, employee_id, allocated_by, remarks) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE assets SET status = 'allocated' WHERE id = $1`,
        [asset_id]
      );

      const allocation = await client.query(
        `INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, allocated_date, status)
         VALUES ($1, $2, $3, CURRENT_DATE, 'active') RETURNING *`,
        [asset_id, employee_id, allocated_by]
      );

      await client.query(
        `INSERT INTO asset_history (asset_id, action, remarks, created_by, created_at)
         VALUES ($1, 'allocated', $2, $3, NOW())`,
        [asset_id, remarks || "Asset allocated", allocated_by]
      );

      await client.query("COMMIT");
      return allocation.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // Return asset (transaction)
  returnAsset: async (asset_id, returned_by, remarks) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        `UPDATE assets SET status = 'available' WHERE id = $1`,
        [asset_id]
      );

      await client.query(
        `UPDATE asset_allocations SET status = 'returned', return_date = CURRENT_DATE
         WHERE asset_id = $1 AND status = 'active'`,
        [asset_id]
      );

      await client.query(
        `INSERT INTO asset_history (asset_id, action, remarks, created_by, created_at)
         VALUES ($1, 'returned', $2, $3, NOW())`,
        [asset_id, remarks || "Asset returned", returned_by]
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  getHistory: async (asset_id) => {
    const result = await pool.query(
      `SELECT ah.*, u.name AS performed_by_name
       FROM asset_history ah
       LEFT JOIN users u ON ah.created_by = u.id
       WHERE ah.asset_id = $1
       ORDER BY ah.created_at DESC`,
      [asset_id]
    );
    return result.rows;
  },

  getTypes: async () => {
    const result = await pool.query(
      `SELECT DISTINCT asset_type FROM assets ORDER BY asset_type`
    );
    return result.rows.map(r => r.asset_type);
  },
};

module.exports = assetRepository;
