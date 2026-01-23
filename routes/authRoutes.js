const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleAuth,
  setPassword,
} = require("../controllers/authController");

const { adminLogin } = require("../controllers/adminAuthController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const validate = require("../middlewares/validateMiddleware");
const authRateLimiter = require("../middlewares/rateLimiter");
const { protectUser } = require("../middlewares/authMiddleware");

/* ===========================
   USER AUTH ROUTES
=========================== */

// Register (OTP email)
router.post(
  "/register",
  authRateLimiter({
    prefix: "auth:user:register",
    maxRequests: 3,
  }),
  registerValidator,
  validate,
  register
);

// Login
router.post(
  "/login",
  authRateLimiter({
    prefix: "auth:user:login",
    maxRequests: 5,
  }),
  loginValidator,
  validate,
  login
);

router.post(
  "/google",
  authRateLimiter({
    prefix: "auth:user:google",
    maxRequests: 5,
  }),
  googleAuth,
);


// Verify Email OTP (stricter)
router.post(
  "/verify-email",
  authRateLimiter({
    prefix: "auth:user:verify-email",
    maxRequests: 3,
  }),
  verifyEmail
);

// Resend OTP (very strict)
router.post(
  "/resend-otp",
  authRateLimiter({
    prefix: "auth:user:resend-otp",
    maxRequests: 2,
  }),
  resendOtp
);

// Forgot Password
router.post(
  "/forgot-password",
  authRateLimiter({
    prefix: "auth:user:forgot-password",
    maxRequests: 3,
  }),
  forgotPassword
);

// Reset Password (token based → no limiter)
router.put("/reset-password/:token", resetPassword);

// Set Password (for Google users)
router.put(
  "/set-password",
  protectUser,
  setPassword
);


/* ===========================
   ADMIN AUTH ROUTES
=========================== */

// Admin login (very strict)
router.post(
  "/admin-login",
  authRateLimiter({
    prefix: "auth:admin:login",
    maxRequests: 3,
  }),
  loginValidator,
  validate,
  adminLogin
);

module.exports = router;
