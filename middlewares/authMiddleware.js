

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Admin = require("../models/Admin");
const connectDB = require("../config/db")

// =====================
// USER PROTECT
// =====================


const protectUser = asyncHandler(async (req, res, next) => {
  // await connectDB(); 
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
// ADMIN PROTECT
// =====================
const protectAdmin = asyncHandler(async (req, res, next) => {
  // await connectDB(); 
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin token required",
    });
  }

  const admin = await Admin.findById(decoded.id).select("-password");

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Admin not found",
    });
  }

  req.admin = admin;
  next();
});

module.exports = { protectUser, protectAdmin };

