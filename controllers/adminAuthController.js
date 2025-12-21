const asyncHandler = require("express-async-handler");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger");

/**
 * @desc    Register new admin (initial setup / dev only)
 * @route   POST /api/admin/register
 * @access  Restricted (should be protected or removed in production)
 */
const adminRegister = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;

  // 1. Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  email = email.toLowerCase();

  // 2. Check existing admin
  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  // 3. Create admin (password hashing handled by schema)
  const admin = await Admin.create({
    name,
    email,
    password,
  });

  logger.info(`Admin registered: ${admin._id}`);

  // 4. Response
  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    permissions: admin.permissions,
    token: generateToken(admin._id, "admin"),
  });
});

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
const adminLogin = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  email = email.toLowerCase();

  const admin = await Admin.findOne({ email });

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  logger.info(`Admin logged in: ${admin._id}`);

  res.status(200).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    permissions: admin.permissions,
    token: generateToken(admin._id, "admin"),
  });
});

module.exports = {
  adminRegister,
  adminLogin,
};
