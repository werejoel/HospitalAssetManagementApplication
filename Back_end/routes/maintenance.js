const express = require("express");
const router = express.Router();
const { createCrudControllers } = require("../controllers/crudController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const maintenanceController = createCrudControllers("maintenance_records", ["asset_id", "maintenance_date", "maintenance_type", "description", "cost", "technician_id", "status"]);

router.get("/", authenticateToken, maintenanceController.getAll);
router.get("/:id", authenticateToken, maintenanceController.getById);
router.post("/", authenticateToken, authorizeRoles("admin", "technician"), maintenanceController.create);
router.put("/:id", authenticateToken, authorizeRoles("admin", "technician"), maintenanceController.update);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), maintenanceController.delete);

module.exports = router;
