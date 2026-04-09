const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deactivateUser, deleteUser, getLoginProfiles } = require("../controllers/userController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get("/", authenticateToken, getUsers);
router.get("/profiles", getLoginProfiles); // Public endpoint for login profiles
router.get("/:id", authenticateToken, getUserById);
router.post("/", authenticateToken, authorizeRoles("admin"), createUser);
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateUser);
router.patch("/:id/deactivate", authenticateToken, authorizeRoles("admin"), deactivateUser);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteUser);

module.exports = router;
