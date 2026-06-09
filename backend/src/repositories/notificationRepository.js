const pool = require("../../config/db");

const notificationRepository = {
  create: async ({ user_id, title, message }) => {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1, $2, $3, FALSE, NOW()) RETURNING *`,
      [user_id, title, message]
    );
    return result.rows[0];
  },

  findByUser: async (user_id) => {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user_id]
    );
    return result.rows;
  },

  getUnreadCount: async (user_id) => {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [user_id]
    );
    return parseInt(result.rows[0].count);
  },

  markRead: async (id, user_id) => {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
  },

  markAllRead: async (user_id) => {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [user_id]
    );
  },
};

module.exports = notificationRepository;
