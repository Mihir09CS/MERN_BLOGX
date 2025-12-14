
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");
const validate = require("../middlewares/validateMiddleware");

// ✅ Register & Login
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

// ✅ Forgot & Reset Password
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
