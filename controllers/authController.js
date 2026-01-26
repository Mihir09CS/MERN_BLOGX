const { OAuth2Client } = require("google-auth-library");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const { json } = require("stream/consumers");
const { errorMonitor } = require("events");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
    emailOtp: hashedOtp,
    emailOtpExpires: Date.now() + 10 * 60 * 1000, // 10 min
  });

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });

  res.status(201).json({
    message: "OTP sent to email. Please verify your account.",
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

  // if (!user || !(await user.matchPassword(password))) {
  //   res.status(401);
  //   throw new Error("Invalid email or password");
  // }
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Block password login for Google users
 if (user.authProvider === "google" && !user.password) {
   res.status(400);
   throw new Error("Please login using Google");
 }


  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }


  if (!user.isVerified) {
    res.status(403);
    throw new Error("Please verify your email first");
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

const setPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.password) {
    res.status(400);
    throw new Error("Password already set");
  }

  user.password = password;
  await user.save();

  res.json({ message: "Password set successfully" });
});

// @desc Google Authentication
// @route POST /api/auth/google
// @access Public
const googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Google token is required");
  }

  // Verify token with Google
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  if (!email) {
    res.status(400);
    throw new Error("Google account email not found");
  }

  // Find user by googleId OR email
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  // New user
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: "google",
      isVerified: true,
    });
  }
  // Existing local user → link Google
  else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = "google";
    user.isVerified = true;
    await user.save();
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("User is banned");
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id, "user"),
    hasPassword: !!user.password,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("Email already verified");
  }

  if (!user.emailOtp || user.emailOtpExpires < Date.now()) {
    res.status(400);
    throw new Error("OTP expired. Please resend OTP.");
  }

  const isMatch = await bcrypt.compare(otp, user.emailOtp);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;

  await user.save();

  // ✅ Welcome Email
  await sendEmail({
    to: user.email,
    subject: "Welcome to DevScribe 🎉",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to DevScribe-A modern Blog platform</title>
</head>

<body style="margin:0; padding:0; background-color:#fafafa;
font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="100%" style="max-width:420px; background:#ffffff;
        border-radius:8px; border:1px solid #dbdbdb; padding:32px;">

          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; font-weight:600; color:#262626;">DevScribe</h2>
            </td>
          </tr>

          <tr>
            <td style="color:#262626; font-size:18px; font-weight:600; padding-bottom:12px;">
              Welcome, ${user.name} 👋
            </td>
          </tr>

          <tr>
            <td style="color:#4f4f4f; font-size:14px; line-height:1.6; padding-bottom:24px;">
              Your email has been successfully verified.
              You can now explore blogs, publish content, and connect with others.
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="https://devscribe-a.netlify.app/login"
                 style="background:#0095f6; color:#ffffff; text-decoration:none;
                 padding:12px 24px; border-radius:6px;
                 font-size:14px; font-weight:600; display:inline-block;">
                Get Started
              </a>
            </td>
          </tr>

          <tr>
            <td style="color:#8e8e8e; font-size:12px; line-height:1.5;">
              If you did not create this account, you can safely ignore this email.
              <br/><br/>
              © ${new Date().getFullYear()} DevScribe
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`,
  });

  // await sendEmail({
  //   to: user.email,
  //   subject: "Welcome to DevScribe-A modern blog platform🎉",
  //   html: `
  //     <h2>Welcome, ${user.name}!</h2>
  //     <p>Your account has been successfully verified.</p>
  //   `,
  // });

  res.json({
    message: "Email verified successfully",
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("Email already verified");
  }

  const otp = generateOtp();
  user.emailOtp = await bcrypt.hash(otp, 10);
  user.emailOtpExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmail({
    to: email,
    subject: "Resend OTP",
    html: `
      <h3>Your new OTP:</h3>
      <h2>${otp}</h2>
      <p>Valid for 10 minutes.</p>
    `,
  });

  res.json({ message: "New OTP sent to email" });
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

  // Block Google-only users
  if (user.authProvider === "google" && !user.password) {
    res.status(400);
    throw new Error("Password reset is not available for Google accounts");
  }


  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

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

  // Block Google-only users
  if (user.authProvider === "google" && !user.password) {
    res.status(400);
    throw new Error("Password reset is not allowed for Google accounts");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  // const user = await User.findOne({
  //   resetPasswordToken,
  //   resetPasswordExpires: { $gt: Date.now() },
  // });

  // if (!user) {
  //   res.status(400);
  //   throw new Error("Invalid or expired token");
  // }

  // user.password = req.body.password;
  // user.resetPasswordToken = undefined;
  // user.resetPasswordExpires = undefined;

  // await user.save();
  console.log("RESET TOKEN (DEV):", req.params.token);
  logger.info(`Password reset successful for user: ${user._id}`);

  res.json({ message: "Password reset successful" });
});

module.exports = {
  register,
  login,
  setPassword,
  googleAuth,
  forgotPassword,
  verifyEmail,
  resendOtp,
  resetPassword,
};
