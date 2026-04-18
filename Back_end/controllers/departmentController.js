const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

// Departments
const getDepartments = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments ORDER BY department_name",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createDepartment = async (req, res) => {
  const { department_name, location, head_of_department, contact } = req.body;
  try {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO departments (id, department_name, location, head_of_department, contact, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [id, department_name, location, head_of_department, contact],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { department_name, location, head_of_department, contact } = req.body;
  try {
    const result = await pool.query(
      `UPDATE departments SET department_name = $1, location = $2, head_of_department = $3, contact = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [department_name, location, head_of_department, contact, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Department not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM departments WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Department not found" });
    res.json({ message: "Department deleted", department: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
