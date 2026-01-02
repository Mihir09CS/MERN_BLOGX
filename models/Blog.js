
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, text: true },
    content: { type: String, required: true, text: true },
    excerpt: { type: String },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: { type: String },
    tags: [{ type: String }],

    // ✅ FIX: store uploaded cover image path
    coverImage: {
      url: { type: String },
      fileId: { type: String },
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    views: { type: Number, default: 0 },

    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    visibility: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
    },
    removedAt: {
      type: Date,
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Virtual reading time
blogSchema.virtual("readingTime").get(function () {
  const words = (this.content || "").split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
});

blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Blog", blogSchema);
