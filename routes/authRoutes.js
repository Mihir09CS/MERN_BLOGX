

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { adminLogin } = require("../controllers/adminAuthController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const validate = require("../middlewares/validateMiddleware");
const authRateLimiter = require("../middlewares/rateLimiter");

/* ===========================
   USER AUTH ROUTES (LIMITED)
=========================== */

// Register (OTP email)
router.post(
  "/register",
  authRateLimiter({ prefix: "register", maxRequests: 5 }),
  registerValidator,
  validate,
  register
);

// Login
router.post(
  "/login",
  authRateLimiter({ prefix: "login", maxRequests: 5 }),
  loginValidator,
  validate,
  login
);

// Verify Email OTP
router.post(
  "/verify-email",
  authRateLimiter({ prefix: "verify-email", maxRequests: 5 }),
  verifyEmail
);

// Resend OTP (stricter)
router.post(
  "/resend-otp",
  authRateLimiter({ prefix: "resend-otp", maxRequests: 3 }),
  resendOtp
);

// Forgot Password
router.post(
  "/forgot-password",
  authRateLimiter({ prefix: "forgot-password", maxRequests: 3 }),
  forgotPassword
);

// Reset Password (token based, no limiter needed)
router.put("/reset-password/:token", resetPassword);

/* ===========================
   ADMIN AUTH ROUTES (STRICT)
=========================== */

// Admin login (very strict)
router.post(
  "/admin-login",
  authRateLimiter({ prefix: "admin-login", maxRequests: 3 }),
  loginValidator,
  validate,
  adminLogin
);

module.exports = router;
