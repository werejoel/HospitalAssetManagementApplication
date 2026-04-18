const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM asset_categories ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM asset_categories WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset category not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get category error:", err);
    res.status(500).json({ error: err.message });
  }
};

const createCategory = async (req, res) => {
  const { category_name, description } = req.body;
  try {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO asset_categories (id, category_name, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, category_name, description],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE asset_categories SET category_name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [category_name, description, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset category not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM asset_categories WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset category not found" });
    }
    res.json({ message: "Asset category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
