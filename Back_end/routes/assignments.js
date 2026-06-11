const express = require("express");
const router = express.Router();
const { createCrudControllers } = require("../controllers/crudController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const assignmentController = createCrudControllers("asset_assignments", ["asset_id", "assigned_to", "department_id", "status"]);

router.get("/", authenticateToken, assignmentController.getAll);
router.get("/:id", authenticateToken, assignmentController.getById);
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager", "store_manager", "technician", "staff","department_head"), assignmentController.create);
router.put("/:id", authenticateToken, authorizeRoles("admin", "asset_manager", "store_manager", "technician", "staff","department_head"), assignmentController.update);
router.delete("/:id", authenticateToken, authorizeRoles("admin", "asset_manager", "store_manager","department_head"), assignmentController.delete);

module.exports = router;
