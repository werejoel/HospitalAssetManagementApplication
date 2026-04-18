const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

// Get all assets
const getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, ac.category_name, s.supplier_name, d.department_name
       FROM assets a
       LEFT JOIN asset_categories ac ON a.category_id = ac.id
       LEFT JOIN suppliers s ON a.supplier_id = s.id
       LEFT JOIN departments d ON a.department_id = d.id
       ORDER BY a.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get assets error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single asset by ID
const getAssetById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, ac.category_name, s.supplier_name, d.department_name
       FROM assets a
       LEFT JOIN asset_categories ac ON a.category_id = ac.id
       LEFT JOIN suppliers s ON a.supplier_id = s.id
       LEFT JOIN departments d ON a.department_id = d.id
       WHERE a.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get asset error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new asset
const createAsset = async (req, res) => {
  const {
    asset_name,
    asset_tag,
    serial_number,
    category_id,
    purchase_date,
    purchase_cost,
    supplier_id,
    warranty_expiry,
    asset_condition,
    status,
    department_id,
  } = req.body;

  try {
    // Check if asset_tag already exists
    const tagExists = await pool.query(
      "SELECT * FROM assets WHERE asset_tag = $1",
      [asset_tag],
    );
    if (tagExists.rows.length > 0) {
      return res.status(400).json({ error: "Asset tag already exists" });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO assets (id, asset_name, asset_tag, serial_number, category_id, purchase_date, purchase_cost, supplier_id, warranty_expiry, asset_condition, status, department_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        id,
        asset_name,
        asset_tag,
        serial_number,
        category_id,
        purchase_date,
        purchase_cost,
        supplier_id,
        warranty_expiry,
        asset_condition || "good",
        status || "available",
        department_id,
      ],
    );

    res.status(201).json({
      message: "Asset created successfully",
      asset: result.rows[0],
    });
  } catch (err) {
    console.error("Create asset error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update asset
const updateAsset = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    values.push(id);

    const result = await pool.query(
      `UPDATE assets SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({
      message: "Asset updated successfully",
      asset: result.rows[0],
    });
  } catch (err) {
    console.error("Update asset error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete asset (soft delete)
const deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE assets SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({
      message: "Asset deleted successfully",
      asset: result.rows[0],
    });
  } catch (err) {
    console.error("Delete asset error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
