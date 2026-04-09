const express = require("express");
const router = express.Router();
const { createCrudControllers } = require("../controllers/crudController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const supplierController = createCrudControllers("suppliers", ["supplier_name", "contact_person", "phone", "email", "address"]);

router.get("/", authenticateToken, supplierController.getAll);
router.get("/:id", authenticateToken, supplierController.getById);
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager"), supplierController.create);
router.put("/:id", authenticateToken, authorizeRoles("admin", "asset_manager"), supplierController.update);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), supplierController.delete);

module.exports = router;
