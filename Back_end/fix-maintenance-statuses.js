const pool = require("./db_config");

async function fixMaintenanceAssetStatuses() {
  try {
    console.log("Fixing asset statuses for active maintenance records...");

    // Get all assets that have active maintenance (scheduled or in_progress)
    const activeMaintenance = await pool.query(`
      SELECT DISTINCT mr.asset_id
      FROM maintenance_records mr
      WHERE mr.status IN ('scheduled', 'in_progress')
    `);

    console.log(
      `Found ${activeMaintenance.rows.length} assets with active maintenance`,
    );

    // Update these assets to 'under maintenance' status
    for (const record of activeMaintenance.rows) {
      await pool.query(
        `UPDATE assets SET status = 'under maintenance', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [record.asset_id],
      );
      console.log(`Updated asset ${record.asset_id} to 'under maintenance'`);
    }

    // Get all assets that have NO active maintenance and are currently 'under maintenance'
    // These should be set back to 'available' if they don't have active maintenance
    const orphanedMaintenanceAssets = await pool.query(`
      SELECT a.id, a.asset_name
      FROM assets a
      WHERE a.status = 'under maintenance'
      AND NOT EXISTS (
        SELECT 1 FROM maintenance_records mr
        WHERE mr.asset_id = a.id AND mr.status IN ('scheduled', 'in_progress')
      )
    `);

    console.log(
      `Found ${orphanedMaintenanceAssets.rows.length} assets that should be available`,
    );

    // Update these assets back to 'available'
    for (const asset of orphanedMaintenanceAssets.rows) {
      await pool.query(
        `UPDATE assets SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [asset.id],
      );
      console.log(
        `Updated asset ${asset.id} (${asset.asset_name}) back to 'available'`,
      );
    }

    console.log("Asset status fix completed");
  } catch (error) {
    console.error("Error fixing asset statuses:", error);
  } finally {
    await pool.end();
  }
}

fixMaintenanceAssetStatuses();
