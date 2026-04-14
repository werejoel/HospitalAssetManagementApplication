const express = require("express");
const router = express.Router();
const { getAllDisposals, getDisposalById, createDisposal, updateDisposal, deleteDisposal } = require("../controllers/disposalsController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get("/", authenticateToken, getAllDisposals);
router.get("/:id", authenticateToken, getDisposalById);
router.post("/", authenticateToken, authorizeRoles("admin", "asset_manager"), createDisposal);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateDisposal);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteDisposal);

module.exports = router;
