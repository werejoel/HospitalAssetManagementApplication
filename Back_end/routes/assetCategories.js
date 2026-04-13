const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/assetCategoryController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get("/", authenticateToken, getAllCategories);
router.get("/:id", authenticateToken, getCategoryById);
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager"), createCategory);
router.put("/:id", authenticateToken, authorizeRoles("admin", "asset_manager"), updateCategory);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteCategory);
module.exports = router;
