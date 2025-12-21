// ______________________________________________________

const logger = require("../utils/logger");

const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { json } = require("stream/consumers");


// Register User
const register = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  email = email.toLowerCase();

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id, "user"),
  });
});

// Login User ONLY
const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  email = email.toLowerCase();

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("User is banned");
  }

  logger.info(`User logged in: ${user._id}`);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id, "user"),
  });
});


// @desc Forgot Password
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user with that email");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/reset-password/${resetToken}`;

  const message = `You requested a password reset. Click the link to reset your password:\n\n${resetUrl}\n\nIf you did not request, ignore this email.`;

  try {
    await sendEmail({
      to: user.email.toLowerCase(),
      subject: "Password Reset Request",
      text: message,
    });
    logger.info(`Password reset requested for email: ${user.email}`);

    res.json({ message: "Email sent with password reset instructions" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    logger.error(`Password reset email failed for ${user.email}`, error);
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc Reset Password
// @route PUT /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  // console.log("RESET TOKEN (DEV):", req.params.token);
  logger.info(`Password reset successful for user: ${user._id}`);


  res.json({ message: "Password reset successful" });
});

module.exports = { register, login, forgotPassword, resetPassword };

