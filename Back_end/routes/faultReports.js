const express = require("express");
const router = express.Router();
const { createCrudControllers } = require("../controllers/crudController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const faultController = createCrudControllers("fault_reports", ["asset_id", "description", "priority", "report_date", "reported_by", "assigned_to", "status", "resolution_notes"]);

router.get("/", authenticateToken, faultController.getAll);
router.get("/:id", authenticateToken, faultController.getById);
router.post("/", authenticateToken, authorizeRoles("admin", "technician", "staff"), faultController.create);
router.put("/:id", authenticateToken, authorizeRoles("admin", "technician"), faultController.update);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), faultController.delete);

module.exports = router;
