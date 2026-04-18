const pool = require("../db_config");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Get login profiles (public endpoint)
const getLoginProfiles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.role_id, r.role_name, d.department_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_name
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.status = 'active'
       ORDER BY u.role_id, u.full_name`,
    );

    // Group users by role and pick one representative for each role
    const profiles = {};
    result.rows.forEach((user) => {
      if (!profiles[user.role_id]) {
        profiles[user.role_id] = {
          id: user.role_id,
          label: getRoleDisplayName(user.role_id),
          icon: getRoleIcon(user.role_id),
          email: user.email,
          role: user.role_id,
          department: user.department_name,
          full_name: user.full_name,
        };
      }
    });

    res.json(Object.values(profiles));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to get display name for roles
const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: "Administrator",
    asset_manager: "Asset Manager",
    technician: "Technician",
    department_head: "Department Head",
    staff: "Staff",
  };
  return roleNames[role] || role;
};

// Helper function to get icon for roles
const getRoleIcon = (role) => {
  const roleIcons = {
    admin: "👨‍💼",
    asset_manager: "📊",
    technician: "🔧",
    department_head: "👨‍⚕️",
    staff: "👤",
  };
  return roleIcons[role] || "👤";
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.username, u.email, u.phone_number, u.role_id, u.department_id, u.status, d.department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY u.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single user
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.username, u.email, u.phone_number, u.role_id, u.department_id, u.status, d.department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.user_id = $1`,
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  const {
    full_name,
    username,
    email,
    password,
    phone_number,
    role_id,
    department_id,
  } = req.body;
  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || "default123", 10);
    const userId = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (user_id, full_name, username, email, password, phone_number, role_id, department_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW())
       RETURNING user_id, full_name, username, email, phone_number, role_id, department_id, status`,
      [
        userId,
        full_name,
        username,
        email,
        hashedPassword,
        phone_number,
        role_id,
        department_id,
      ],
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, phone_number, department_id, role_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET full_name = $1, phone_number = $2, department_id = $3, role_id = $4, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5 RETURNING user_id, full_name, email, username, phone_number, role_id, department_id, status`,
      [full_name, phone_number, department_id, role_id, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 RETURNING user_id, full_name, email, username, status`,
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deactivated", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE user_id = $1 RETURNING user_id, full_name, email`,
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  deleteUser,
  getLoginProfiles,
};
