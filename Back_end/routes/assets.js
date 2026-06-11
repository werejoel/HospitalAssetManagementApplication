const express = require("express");
const router = express.Router();
const { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require("../controllers/assetController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all assets
router.get("/", authenticateToken, getAllAssets);

// Get single asset
router.get("/:id", authenticateToken, getAssetById);

// Create asset (admin/store manager only)
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager", "store_manager"), createAsset);

// Update asset (admin/store manager only)
router.put("/:id", authenticateToken, authorizeRoles("admin", "asset_manager", "store_manager"), updateAsset);

// Delete asset (admin only)
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteAsset);

module.exports = router;
