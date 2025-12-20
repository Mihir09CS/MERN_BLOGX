

// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     // role management
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },

//     // relations
//     followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],

//     // password reset
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,

//     // admin moderation fields
//     isBanned: { type: Boolean, default: false },
//     bannedAt: { type: Date, default: null },
//     banReason: { type: String, default: null },
//   },
//   { timestamps: true }
// );

// // Password hashing middleware
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare password
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // Generate Reset Token
// userSchema.methods.getResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
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

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and save to DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expiry (10 minutes)
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


module.exports = mongoose.model("User", userSchema);
