const mongoose = require("mongoose");

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "BLOG_REMOVED",
        "BLOG_RESTORED",
        "BLOG_DELETED",
        "USER_DELETED",
        "USER_BANNED",
        "USER_UNBANNED",
        "REPORT_REVIEWED",
      ],
    },
    targetType: {
      type: String,
      enum: ["Blog", "User", "Report"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    meta: {
      type: Object,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdminActionLog", adminActionLogSchema);
