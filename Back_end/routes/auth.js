const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { validateRequired } = require("../middleware/validation");

// Register
router.post("/register", validateRequired(["full_name", "username", "email", "password"]), register);

// Login
router.post("/login", validateRequired(["email", "password"]), login);

module.exports = router;
