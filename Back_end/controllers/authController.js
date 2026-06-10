const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db_config");
const { v4: uuidv4 } = require("uuid");

const register = async (req, res) => {
  const { full_name, username, email, password, phone_number, role } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [lowerEmail, username],
    );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (user_id, full_name, username, email, password, phone_number, role_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING user_id, full_name, email, username, phone_number, role_id`,
      [
        userId,
        full_name,
        username,
        lowerEmail,
        hashedPassword,
        phone_number,
        role || "staff",
        "active",
      ],
    );

    const token = jwt.sign(
      {
        id: result.rows[0].user_id,
        role: role || "staff",
        email: result.rows[0].email,
      },
      process.env.JWT_SECRET || "mrrh_secret_key",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.rows[0].user_id,
        full_name: result.rows[0].full_name,
        email: result.rows[0].email,
        username: result.rows[0].username,
        role: result.rows[0].role_id,
        phone_number: result.rows[0].phone_number,
      },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase();

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      lowerEmail,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.status === "inactive") {
      return res.status(403).json({
        error:
          "Your account has been deactivated. Please contact an administrator.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        error: "Your account has been blocked. Please contact an administrator.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role_id, email: user.email },
      process.env.JWT_SECRET || "mrrh_secret_key",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role_id,
        phone_number: user.phone_number,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

const verify = async (req, res) => {
  try {
    // The authenticateToken middleware has already validated the token
    // and set req.user with the decoded token payload
    const userId = req.user.id;

    // Fetch the current user data from the database
    const result = await pool.query(
      "SELECT user_id, full_name, email, username, phone_number, role_id, status FROM users WHERE user_id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const account = result.rows[0];

    if (account.status === "inactive") {
      return res.status(403).json({
        error:
          "Your account has been deactivated. Please contact an administrator.",
      });
    }

    if (account.status === "suspended") {
      return res.status(403).json({
        error: "Your account has been blocked. Please contact an administrator.",
      });
    }

    res.json({
      user: {
        id: account.user_id,
        full_name: account.full_name,
        email: account.email,
        username: account.username,
        role: account.role_id,
        phone_number: account.phone_number,
      },
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, verify };
