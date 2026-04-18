const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

// Generic CRUD controller factory
const createCrudControllers = (tableName, fields) => {
  return {
    getAll: async (req, res) => {
      try {
        const result = await pool.query(
          `SELECT * FROM ${tableName} ORDER BY created_at DESC`,
        );
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getById: async (req, res) => {
      const { id } = req.params;
      try {
        const result = await pool.query(
          `SELECT * FROM ${tableName} WHERE id = $1`,
          [id],
        );
        if (result.rows.length === 0)
          return res.status(404).json({ error: `${tableName} not found` });
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    create: async (req, res) => {
      try {
        const values = [uuidv4(), ...fields.map((f) => req.body[f])];
        const placeholders = fields.map((_, i) => `$${i + 2}`).join(", ");
        const fieldNames = ["id", ...fields].join(", ");

        const result = await pool.query(
          `INSERT INTO ${tableName} (${fieldNames}, created_at, updated_at) VALUES ($1, ${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
          values,
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    update: async (req, res) => {
      const { id } = req.params;
      try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        fields.forEach((field) => {
          if (req.body[field] !== undefined) {
            updates.push(`${field} = $${paramCount}`);
            values.push(req.body[field]);
            paramCount++;
          }
        });

        if (updates.length === 0)
          return res.status(400).json({ error: "No fields to update" });

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await pool.query(
          `UPDATE ${tableName} SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
          values,
        );

        if (result.rows.length === 0)
          return res.status(404).json({ error: `${tableName} not found` });
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    delete: async (req, res) => {
      const { id } = req.params;
      try {
        const result = await pool.query(
          `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
          [id],
        );
        if (result.rows.length === 0)
          return res.status(404).json({ error: `${tableName} not found` });
        res.json({ message: "Deleted successfully", data: result.rows[0] });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  };
};

module.exports = { createCrudControllers };
