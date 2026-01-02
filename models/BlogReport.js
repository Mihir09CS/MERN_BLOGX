const mongoose = require("mongoose");

const blogReportSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "abuse", "hate", "plagiarism", "misinformation", "other"],
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String, 
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate reports by same user on same blog
blogReportSchema.index({ blog: 1, reporter: 1 }, { unique: true });

module.exports = mongoose.model("BlogReport", blogReportSchema);
