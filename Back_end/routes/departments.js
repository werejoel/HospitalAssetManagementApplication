const express = require("express");
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/departmentController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get("/", authenticateToken, getDepartments);
router.post("/", authenticateToken, authorizeRoles("admin"), createDepartment);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateDepartment);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteDepartment);

module.exports = router;
