const express = require("express");
const router = express.Router();
const { getAllMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance } = require("../controllers/maintenanceController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get("/", authenticateToken, getAllMaintenance);
router.get("/:id", authenticateToken, getMaintenanceById);
router.post("/", authenticateToken, authorizeRoles("admin", "technician","store_manager","asset_manager"), createMaintenance);
router.put("/:id", authenticateToken, authorizeRoles("admin", "technician","store_manager","asset_manager",), updateMaintenance);
router.delete("/:id", authenticateToken, authorizeRoles("admin","store_manager","asset_manager",), deleteMaintenance);
module.exports = router;
