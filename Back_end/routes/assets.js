const express = require("express");
const router = express.Router();
const { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require("../controllers/assetController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all assets
router.get("/", authenticateToken, getAllAssets);

// Get single asset
router.get("/:id", authenticateToken, getAssetById);

// Create asset (admin/asset_manager only)
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager"), createAsset);

// Update asset (admin/asset_manager only)
router.put("/:id", authenticateToken, authorizeRoles("admin", "asset_manager"), updateAsset);

// Delete asset (admin only)
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteAsset);

module.exports = router;
