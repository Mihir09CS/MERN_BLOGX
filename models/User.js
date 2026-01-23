
// const crypto = require("crypto");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     emailOtp: {
//       type: String,
//     },

//     emailOtpExpires: {
//       type: Date,
//     },

//     bookmarks: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Blog",
//       },
//     ],

//     isBanned: {
//       type: Boolean,
//       default: false,
//     },

//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//   },
//   { timestamps: true }
// );

// // Hash password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// userSchema.methods.getResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
//   return resetToken;
// };

// module.exports = mongoose.model("User", userSchema);

const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password is optional (Google users)
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },

    // Auth provider tracking
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Google account ID
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Email verification (local users)
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
    },

    emailOtpExpires: {
      type: Date,
    },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],

    isBanned: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

//
// Password hashing (only when password exists)
//
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//
// Compare password (local users only)
//
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

//
// Reset password token (local users)
//
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
