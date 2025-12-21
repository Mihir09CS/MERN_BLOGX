

// const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");
// const User = require("../models/User");
// const Admin = require("../models/Admin");

// // =====================
// // USER PROTECT
// // =====================
// const protectUser = asyncHandler(async (req, res, next) => {
//   let token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     res.status(401);
//     throw new Error("Not authorized, no token");
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET);

//   if (decoded.type !== "user") {
//     res.status(403);
//     throw new Error("User token required");
//   }

//   const user = await User.findById(decoded.id).select("-password");
//   if (!user) {
//     res.status(401);
//     throw new Error("User not found");
//   }

//   if (user.isBanned) {
//     res.status(403);
//     throw new Error("User is banned");
//   }

//   req.user = user;
//   next();
// });

// // =====================
// // ADMIN PROTECT
// // =====================
// const protectAdmin = asyncHandler(async (req, res, next) => {
//   let token = req.headers.authorization?.split(" ")[1];
//   if (!token) {
//     res.status(401);
//     throw new Error("Not authorized, no token");
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET);

//   if (decoded.type !== "admin") {
//     res.status(403);
//     throw new Error("Admin token required");
//   }

//   const admin = await Admin.findById(decoded.id).select("-password");
//   if (!admin) {
//     res.status(401);
//     throw new Error("Admin not found");
//   }

//   req.admin = admin;
//   next();
// });

// module.exports = { protectUser, protectAdmin };


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
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "user") {
    res.status(403);
    throw new Error("User token required");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("User is banned");
  }

  req.user = user;
  next();
});

// =====================
// ADMIN PROTECT
// =====================
const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.type !== "admin") {
    res.status(403);
    throw new Error("Admin token required");
  }

  const admin = await Admin.findById(decoded.id).select("-password");
  if (!admin) {
    res.status(401);
    throw new Error("Admin not found");
  }

  req.admin = admin;
  next();
});

module.exports = { protectUser, protectAdmin };
