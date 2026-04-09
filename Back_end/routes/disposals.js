const express = require("express");
const router = express.Router();
const { createCrudControllers } = require("../controllers/crudController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const disposalController = createCrudControllers("asset_disposals", ["asset_id", "disposal_date", "disposal_method", "reason", "approved_by"]);

router.get("/", authenticateToken, disposalController.getAll);
router.get("/:id", authenticateToken, disposalController.getById);
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager"), disposalController.create);
router.put("/:id", authenticateToken, authorizeRoles("admin"), disposalController.update);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), disposalController.delete);

module.exports = router;
