// const mongoose = require("mongoose");

// const blogSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, text: true },
//     content: { type: String, required: true, text: true },
//     excerpt: { type: String },
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     category: { type: String },
//     tags: [{ type: String }],
//     coverImage: { type: String },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     views: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// // virtual reading time
// blogSchema.virtual("readingTime").get(function () {
//   const words = (this.content || "").split(/\s+/).length;
//   const minutes = Math.ceil(words / 200);
//   return `${minutes} min read`;
// });

// blogSchema.set("toJSON", { virtuals: true });
// blogSchema.set("toObject", { virtuals: true });

// module.exports = mongoose.model("Blog", blogSchema);

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // ✅ only references
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);


const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
