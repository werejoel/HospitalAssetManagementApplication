const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

// Get all disposals
const getAllDisposals = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ad.*, a.asset_name, a.asset_tag, u.full_name as approved_by_name
      FROM asset_disposals ad
      LEFT JOIN assets a ON ad.asset_id = a.id
      LEFT JOIN users u ON ad.approved_by = u.user_id
      ORDER BY ad.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get disposals error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single disposal by ID
const getDisposalById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT ad.*, a.asset_name, a.asset_tag, u.full_name as approved_by_name
      FROM asset_disposals ad
      LEFT JOIN assets a ON ad.asset_id = a.id
      LEFT JOIN users u ON ad.approved_by = u.user_id
      WHERE ad.id = $1
    `,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disposal record not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get disposal error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new disposal
const createDisposal = async (req, res) => {
  const { asset_id, disposal_date, disposal_method, reason, approved_by } =
    req.body;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Create disposal record
    const result = await pool.query(
      `INSERT INTO asset_disposals (id, asset_id, disposal_date, disposal_method, reason, approved_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [uuidv4(), asset_id, disposal_date, disposal_method, reason, approved_by],
    );

    // Update asset status to "disposed"
    await pool.query(
      `UPDATE assets SET status = 'disposed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [asset_id],
    );

    await pool.query("COMMIT");

    // Get the created record with joins
    const finalResult = await pool.query(
      `
      SELECT ad.*, a.asset_name, a.asset_tag, u.full_name as approved_by_name
      FROM asset_disposals ad
      LEFT JOIN assets a ON ad.asset_id = a.id
      LEFT JOIN users u ON ad.approved_by = u.user_id
      WHERE ad.id = $1
    `,
      [result.rows[0].id],
    );

    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Create disposal error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update disposal record
const updateDisposal = async (req, res) => {
  const { id } = req.params;
  const { asset_id, disposal_date, disposal_method, reason, approved_by } =
    req.body;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Update disposal record
    const result = await pool.query(
      `UPDATE asset_disposals SET
       asset_id = $1, disposal_date = $2, disposal_method = $3, reason = $4, approved_by = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [asset_id, disposal_date, disposal_method, reason, approved_by, id],
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Disposal record not found" });
    }

    await pool.query("COMMIT");

    // Get the updated record with joins
    const finalResult = await pool.query(
      `
      SELECT ad.*, a.asset_name, a.asset_tag, u.full_name as approved_by_name
      FROM asset_disposals ad
      LEFT JOIN assets a ON ad.asset_id = a.id
      LEFT JOIN users u ON ad.approved_by = u.user_id
      WHERE ad.id = $1
    `,
      [id],
    );

    res.json(finalResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Update disposal error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete disposal record
const deleteDisposal = async (req, res) => {
  const { id } = req.params;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Get the disposal record to know which asset to update
    const disposalResult = await pool.query(
      "SELECT asset_id FROM asset_disposals WHERE id = $1",
      [id],
    );
    if (disposalResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Disposal record not found" });
    }

    const assetId = disposalResult.rows[0].asset_id;

    // Delete disposal record
    await pool.query("DELETE FROM asset_disposals WHERE id = $1", [id]);

    // Set asset status back to available (or another appropriate status)
    await pool.query(
      `UPDATE assets SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [assetId],
    );

    await pool.query("COMMIT");

    res.json({ message: "Disposal record deleted successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Delete disposal error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllDisposals,
  getDisposalById,
  createDisposal,
  updateDisposal,
  deleteDisposal,
};
