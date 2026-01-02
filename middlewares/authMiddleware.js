

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Admin = require("../models/Admin");


// =====================
// USER PROTECT
// =====================


const protectUser = asyncHandler(async (req, res, next) => {
  
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "user") {
    return res.status(403).json({
      success: false,
      message: "User token required",
    });
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found or token invalid",
    });
  }

  if (user.isBanned) {
    return res.status(403).json({
      success: false,
      message: "User is banned",
    });
  }

  req.user = user;
  next();
});


// =====================
// ADMIN PROTECT (RBAC READY)
// =====================
const protectAdmin = asyncHandler(async (req, res, next) => {
  // 1️⃣ Extract token safely
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  const token = req.headers.authorization.split(" ")[1];

  // 2️⃣ Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
    });
  }

  // 3️⃣ Ensure admin token
  if (decoded.type !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin token required",
    });
  }

  // 4️⃣ Fetch FULL admin from DB (CRITICAL FOR RBAC)
  const admin = await Admin.findById(decoded.id).select("-password");

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Admin not found",
    });
  }

  // 5️⃣ Attach admin (with permissions)
  req.admin = admin;

  next();
});

module.exports = { protectUser, protectAdmin };

