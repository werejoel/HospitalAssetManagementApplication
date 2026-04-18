const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

// Get all maintenance records
const getAllMaintenance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mr.*, a.asset_name, a.asset_tag, u.full_name as technician_name
      FROM maintenance_records mr
      LEFT JOIN assets a ON mr.asset_id = a.id
      LEFT JOIN users u ON mr.technician_id = u.user_id
      ORDER BY mr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get maintenance error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single maintenance record by ID
const getMaintenanceById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT mr.*, a.asset_name, a.asset_tag, u.full_name as technician_name
      FROM maintenance_records mr
      LEFT JOIN assets a ON mr.asset_id = a.id
      LEFT JOIN users u ON mr.technician_id = u.user_id
      WHERE mr.id = $1
    `,
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get maintenance error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new maintenance record
const createMaintenance = async (req, res) => {
  const {
    asset_id,
    maintenance_date,
    maintenance_type,
    description,
    cost,
    technician_id,
    status,
  } = req.body;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Create maintenance record
    const result = await pool.query(
      `INSERT INTO maintenance_records (id, asset_id, maintenance_date, maintenance_type, description, cost, technician_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [
        uuidv4(),
        asset_id,
        maintenance_date,
        maintenance_type,
        description,
        cost,
        technician_id,
        status,
      ],
    );

    // Update asset status based on maintenance status
    let assetStatus = "available"; // default
    if (status === "scheduled" || status === "in_progress") {
      assetStatus = "under maintenance";
    }

    await pool.query(
      `UPDATE assets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [assetStatus, asset_id],
    );

    await pool.query("COMMIT");

    // Get the created record with joins
    const finalResult = await pool.query(
      `
      SELECT mr.*, a.asset_name, a.asset_tag, u.full_name as technician_name
      FROM maintenance_records mr
      LEFT JOIN assets a ON mr.asset_id = a.id
      LEFT JOIN users u ON mr.technician_id = u.user_id
      WHERE mr.id = $1
    `,
      [result.rows[0].id],
    );

    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Create maintenance error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update maintenance record
const updateMaintenance = async (req, res) => {
  const { id } = req.params;
  const {
    asset_id,
    maintenance_date,
    maintenance_type,
    description,
    cost,
    technician_id,
    status,
  } = req.body;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Update maintenance record
    const result = await pool.query(
      `UPDATE maintenance_records SET
       asset_id = $1, maintenance_date = $2, maintenance_type = $3, description = $4,
       cost = $5, technician_id = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [
        asset_id,
        maintenance_date,
        maintenance_type,
        description,
        cost,
        technician_id,
        status,
        id,
      ],
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Maintenance record not found" });
    }

    // Update asset status based on maintenance status
    let assetStatus = "available"; // default
    if (status === "scheduled" || status === "in_progress") {
      assetStatus = "under maintenance";
    }

    await pool.query(
      `UPDATE assets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [assetStatus, asset_id],
    );

    await pool.query("COMMIT");

    // Get the updated record with joins
    const finalResult = await pool.query(
      `
      SELECT mr.*, a.asset_name, a.asset_tag, u.full_name as technician_name
      FROM maintenance_records mr
      LEFT JOIN assets a ON mr.asset_id = a.id
      LEFT JOIN users u ON mr.technician_id = u.user_id
      WHERE mr.id = $1
    `,
      [id],
    );

    res.json(finalResult.rows[0]);
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Update maintenance error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    // Start transaction
    await pool.query("BEGIN");

    // Get the maintenance record to know which asset to update
    const maintenanceResult = await pool.query(
      "SELECT asset_id FROM maintenance_records WHERE id = $1",
      [id],
    );
    if (maintenanceResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "Maintenance record not found" });
    }

    const assetId = maintenanceResult.rows[0].asset_id;

    // Delete maintenance record
    await pool.query("DELETE FROM maintenance_records WHERE id = $1", [id]);

    // Check if there are any other active maintenance records for this asset
    const activeMaintenance = await pool.query(
      `SELECT id FROM maintenance_records WHERE asset_id = $1 AND status IN ('scheduled', 'in_progress')`,
      [assetId],
    );

    // If no active maintenance, set asset status back to available
    if (activeMaintenance.rows.length === 0) {
      await pool.query(
        `UPDATE assets SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [assetId],
      );
    }

    await pool.query("COMMIT");

    res.json({ message: "Maintenance record deleted successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Delete maintenance error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};
