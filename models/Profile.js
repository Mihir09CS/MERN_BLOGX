const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },

    // ✅ ImageKit-compatible avatar structure
    avatar: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
    },

    socialLinks: {
      website: String,
      github: String,
      linkedin: String,
      instagram:String,
      facebook:String,
      twitter: String,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
