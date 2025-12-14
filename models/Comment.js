// const mongoose = require("mongoose");

// const commentSchema = new mongoose.Schema(
//   {
//     blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: { type: String, required: true },
//     parent: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Comment",
//       default: null,
//     },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Comment", commentSchema);


const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null = top-level comment
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
