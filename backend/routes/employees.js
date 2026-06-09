const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");

// Multer setup — saves files to uploads/ folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { files: 5 } });

// POST /api/employees/upload — upload up to 5 images
router.post("/upload", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { employee_id } = req.body;
    const imageUrls = req.files.map((file) => file.filename);

    for (const url of imageUrls) {
      await pool.query(
        "INSERT INTO employee_images(employee_id, image_url) VALUES($1, $2)",
        [employee_id, url]
      );
    }

    res.json({ message: "Images uploaded", files: imageUrls });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// POST /api/employees — create employee profile + assign skills
router.post("/", auth, async (req, res) => {
  try {
    const { user_id, department_id, phone, address, designation, salary, skill_ids } = req.body;

    const emp = await pool.query(
      `INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, department_id, phone, address, designation, salary]
    );

    const employee_id = emp.rows[0].id;

    // Assign skills (many-to-many)
    if (skill_ids && skill_ids.length > 0) {
      for (const skill_id of skill_ids) {
        await pool.query(
          "INSERT INTO employee_skills(employee_id, skill_id) VALUES($1,$2)",
          [employee_id, skill_id]
        );
      }
    }

    res.status(201).json(emp.rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET /api/employees — all employees with name and department (JOIN Query 1)
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.id, ep.user_id, u.name, u.email, d.department_name,
             ep.phone, ep.designation, ep.salary
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});


// GET /api/employees/:id — single employee with skills (JOIN Query 2)
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const empResult = await pool.query(`
      SELECT ep.id, u.name, u.email, d.department_name,
             ep.phone, ep.address, ep.designation, ep.salary
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      WHERE ep.id = $1
    `, [id]);

    const skillsResult = await pool.query(`
      SELECT s.skill_name
      FROM employee_skills es
      INNER JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [id]);

    const imagesResult = await pool.query(
      "SELECT image_url FROM employee_images WHERE employee_id=$1",
      [id]
    );

    res.json({
      ...empResult.rows[0],
      skills: skillsResult.rows.map((r) => r.skill_name),
      images: imagesResult.rows.map((r) => r.image_url),
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// PUT /api/employees/:id — update employee
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, phone, address, designation, salary } = req.body;

    const result = await pool.query(
      `UPDATE employee_profiles
       SET department_id=$1, phone=$2, address=$3, designation=$4, salary=$5
       WHERE id=$6 RETURNING *`,
      [department_id, phone, address, designation, salary, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// DELETE /api/employees/:id — delete employee
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employee_skills WHERE employee_id=$1", [id]);
    await pool.query("DELETE FROM employee_images WHERE employee_id=$1", [id]);
    await pool.query("DELETE FROM employee_profiles WHERE id=$1", [id]);
    res.json({ message: "Employee deleted" });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// GET /api/employees/stats/count — dashboard statistics
router.get("/stats/count", auth, async (req, res) => {
  try {
    const employees = await pool.query("SELECT COUNT(*) FROM employee_profiles");
    const departments = await pool.query("SELECT COUNT(*) FROM departments");
    const skills = await pool.query("SELECT COUNT(*) FROM skills");
    const images = await pool.query("SELECT COUNT(*) FROM employee_images");

    res.json({
      total_employees: employees.rows[0].count,
      total_departments: departments.rows[0].count,
      total_skills: skills.rows[0].count,
      total_images: images.rows[0].count,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;