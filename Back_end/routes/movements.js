const express = require("express");
const router = express.Router();
const { createCrudControllers } = require("../controllers/crudController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const movementController = createCrudControllers("asset_movements", ["asset_id", "from_department_id", "to_department_id", "movement_date", "reason", "moved_by"]);

router.get("/", authenticateToken, movementController.getAll);
router.get("/:id", authenticateToken, movementController.getById);
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager", "technician"), movementController.create);
router.put("/:id", authenticateToken, authorizeRoles("admin", "asset_manager", "technician"), movementController.update);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), movementController.delete);

module.exports = router;
