const pool = require("../config/db");

const employeeRepository = {
  findAll: async ({ page = 1, limit = 20, department_id, search, sortBy = "id", sortOrder = "DESC" }) => {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (department_id) {
      conditions.push(`ep.department_id = $${idx++}`);
      params.push(parseInt(department_id));
    }

    if (search) {
      conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR ep.phone ILIKE $${idx} OR ep.designation ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    
    // Whitelist sort fields
    const allowedSort = ["id", "name", "salary", "designation", "joined_at", "department_name"];
    const mappedSort = {
      id: "ep.id",
      name: "u.name",
      salary: "ep.salary",
      designation: "ep.designation",
      joined_at: "ep.created_at",
      department_name: "d.department_name"
    };

    const safeSort = mappedSort[sortBy] || "ep.id";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const countQuery = `
      SELECT COUNT(*) 
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      ${where}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT ep.id, ep.user_id, u.name, u.email, d.department_name, ep.department_id,
             ep.phone, ep.address, ep.designation, ep.salary, ep.created_at AS joined_at
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      ${where}
      ORDER BY ${safeSort} ${safeOrder}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const result = await pool.query(query, [...params, limit, offset]);

    return {
      data: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  findById: async (id) => {
    const query = `
      SELECT ep.id, ep.user_id, u.name, u.email, d.department_name, ep.department_id,
             ep.phone, ep.address, ep.designation, ep.salary, ep.created_at AS joined_at
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      WHERE ep.id = $1
    `;
    const empResult = await pool.query(query, [id]);
    if (empResult.rows.length === 0) return null;

    const skillsResult = await pool.query(
      `SELECT s.id, s.skill_name
       FROM employee_skills es
       INNER JOIN skills s ON es.skill_id = s.id
       WHERE es.employee_id = $1`,
      [id]
    );

    const imagesResult = await pool.query(
      "SELECT id, image_url FROM employee_images WHERE employee_id = $1",
      [id]
    );

    return {
      ...empResult.rows[0],
      skills: skillsResult.rows,
      images: imagesResult.rows
    };
  },

  create: async ({ user_id, department_id, phone, address, designation, salary, skill_ids }) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertProfile = `
        INSERT INTO employee_profiles (user_id, department_id, phone, address, designation, salary)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `;
      const empResult = await client.query(insertProfile, [
        user_id,
        department_id,
        phone,
        address,
        designation,
        salary,
      ]);
      const employee = empResult.rows[0];

      if (skill_ids && skill_ids.length > 0) {
        for (const skill_id of skill_ids) {
          await client.query(
            "INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1, $2)",
            [employee.id, skill_id]
          );
        }
      }

      await client.query("COMMIT");
      return employee;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  update: async (id, { department_id, phone, address, designation, salary }) => {
    const sets = [];
    const params = [];
    let idx = 1;

    if (department_id !== undefined) {
      sets.push(`department_id = $${idx++}`);
      params.push(department_id);
    }
    if (phone !== undefined) {
      sets.push(`phone = $${idx++}`);
      params.push(phone);
    }
    if (address !== undefined) {
      sets.push(`address = $${idx++}`);
      params.push(address);
    }
    if (designation !== undefined) {
      sets.push(`designation = $${idx++}`);
      params.push(designation);
    }
    if (salary !== undefined) {
      sets.push(`salary = $${idx++}`);
      params.push(salary);
    }

    if (sets.length === 0) return null;

    params.push(id);
    const query = `
      UPDATE employee_profiles 
      SET ${sets.join(", ")} 
      WHERE id = $${idx} 
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  delete: async (id) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM employee_skills WHERE employee_id = $1", [id]);
      await client.query("DELETE FROM employee_images WHERE employee_id = $1", [id]);
      await client.query("DELETE FROM employee_profiles WHERE id = $1", [id]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  addImages: async (employee_id, imageUrls) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const url of imageUrls) {
        await client.query(
          "INSERT INTO employee_images (employee_id, image_url) VALUES ($1, $2)",
          [employee_id, url]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  getStats: async () => {
    const employees = await pool.query("SELECT COUNT(*) FROM employee_profiles");
    const departments = await pool.query("SELECT COUNT(*) FROM departments");
    const skills = await pool.query("SELECT COUNT(*) FROM skills");
    const images = await pool.query("SELECT COUNT(*) FROM employee_images");

    return {
      total_employees: parseInt(employees.rows[0].count),
      total_departments: parseInt(departments.rows[0].count),
      total_skills: parseInt(skills.rows[0].count),
      total_images: parseInt(images.rows[0].count),
    };
  },
};

module.exports = employeeRepository;
