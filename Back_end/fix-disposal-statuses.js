const pool = require("./db_config");

async function fixDisposalAssetStatuses() {
  try {
    console.log("Fixing asset statuses for disposed assets...");

    // Get all assets that have disposal records
    const disposedAssets = await pool.query(`
      SELECT DISTINCT ad.asset_id
      FROM asset_disposals ad
    `);

    console.log(
      `Found ${disposedAssets.rows.length} assets with disposal records`,
    );

    // Update these assets to 'disposed' status
    for (const record of disposedAssets.rows) {
      await pool.query(
        `UPDATE assets SET status = 'disposed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [record.asset_id],
      );
      console.log(`Updated asset ${record.asset_id} to 'disposed'`);
    }

    // Get all assets that are marked as 'disposed' but have no disposal record
    // These should be set back to 'available' if they don't have disposal records
    const orphanedDisposedAssets = await pool.query(`
      SELECT a.id, a.asset_name
      FROM assets a
      WHERE a.status = 'disposed'
      AND NOT EXISTS (
        SELECT 1 FROM asset_disposals ad
        WHERE ad.asset_id = a.id
      )
    `);

    console.log(
      `Found ${orphanedDisposedAssets.rows.length} assets that should not be disposed`,
    );

    // Update these assets back to 'available'
    for (const asset of orphanedDisposedAssets.rows) {
      await pool.query(
        `UPDATE assets SET status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [asset.id],
      );
      console.log(
        `Updated asset ${asset.id} (${asset.asset_name}) back to 'available'`,
      );
    }

    console.log("Disposal asset status fix completed");
  } catch (error) {
    console.error("Error fixing disposal asset statuses:", error);
  } finally {
    await pool.end();
  }
}

fixDisposalAssetStatuses();
