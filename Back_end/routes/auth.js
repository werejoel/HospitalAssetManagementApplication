const express = require("express");
const router = express.Router();
const { register, login, verify } = require("../controllers/authController");
const { validateRequired } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");

// Register
router.post("/register", validateRequired(["full_name", "username", "email", "password"]), register);

// Login
router.post("/login", validateRequired(["email", "password"]), login);

// Verify token
router.get("/verify", authenticateToken, verify);

module.exports = router;
