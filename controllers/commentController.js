// const logger = require("../utils/logger");

// const asyncHandler = require("express-async-handler");
// const Comment = require("../models/Comment");
// const Blog = require("../models/Blog");

// // ************************************
// // @desc Add a comment to a blog
// // @route POST /api/comments/:blogId
// // @access Private
// const addComment = asyncHandler(async (req, res) => {
//   const { blogId } = req.params;
//   const { text, parent } = req.body;

//   const blog = await Blog.findById(blogId);
//   if (!blog) {
//     res.status(404);
//     throw new Error("Blog not found");
//   }

//   // ✅ Create comment
//   const comment = await Comment.create({
//     blog: blog._id,
//     author: req.user._id,
//     text,
//     parent: parent || null,
//   });

//   // ✅ Push reference into Blog.comments array
//   await Blog.findByIdAndUpdate(blog._id, {
//     $push: { comments: comment._id }
//   });

//   res.status(201).json({
//     success: true,
//     message: "Comment added successfully",
//     data: comment,
//   });
// });



// /**
//  * @desc Get all comments for a blog (nested)
//  * @route GET /api/comments/:blogId
//  * @access Public
//  */
// const getComments = asyncHandler(async (req, res) => {
//   const comments = await Comment.find({ blog: req.params.blogId })
//     .populate("author", "name email")
//     .lean();

//   const map = {};
//   comments.forEach((c) => {
//     map[c._id] = {
//       ...c,
//       children: [],
//       likesCount: c.likes?.length || 0,
//       repliesCount: 0,
//     };
//   });

//   const roots = [];
//   comments.forEach((c) => {
//     if (c.parent) {
//       if (map[c.parent]) {
//         map[c.parent].children.push(map[c._id]);
//         map[c.parent].repliesCount += 1;
//       }
//     } else {
//       roots.push(map[c._id]);
//     }
//   });

//   res.json({
//     success: true,
//     count: roots.length,
//     data: roots,
//   });
// });

// /**
//  * @desc Get direct replies for a comment
//  * @route GET /api/comments/:id/replies
//  * @access Public
//  */
// const getReplies = asyncHandler(async (req, res) => {
//   const replies = await Comment.find({ parent: req.params.id })
//     .populate("author", "name email")
//     .lean();

//   res.json({
//     success: true,
//     count: replies.length,
//     data: replies.map((r) => ({
//       ...r,
//       likesCount: r.likes?.length || 0,
//     })),
//   });
// });

// /**
//  * @desc Update comment
//  * @route PUT /api/comments/:id
//  * @access Private
//  */
// const updateComment = asyncHandler(async (req, res) => {
//   const comment = await Comment.findById(req.params.id);

//   if (!comment) {
//     res.status(404);
//     throw new Error("Comment not found");
//   }

//   if (comment.author.toString() !== req.user._id.toString()) {
//     res.status(403);
//     throw new Error("Not authorized to update this comment");
//   }

//   comment.text = req.body.text || comment.text;
//   const updated = await comment.save();

//   const repliesCount = await Comment.countDocuments({ parent: updated._id });

//   res.json({
//     success: true,
//     message: "Comment updated",
//     data: {
//       ...updated.toObject(),
//       likesCount: updated.likes?.length || 0,
//       repliesCount,
//     },
//   });
// });

// /**
//  * @desc Delete comment
//  * @route DELETE /api/comments/:id
//  * @access Private
//  */
// const deleteComment = asyncHandler(async (req, res) => {
//   const comment = await Comment.findById(req.params.id);

//   if (!comment) {
//     logger.warn(`Comment not found ${req.params.id}`);
//     res.status(404);
//     throw new Error("Comment not found");
//   }

//   if (comment.author.toString() !== req.user._id.toString()) {
//     res.status(403);
//     throw new Error("Not authorized");
//   }

//   await comment.deleteOne();
//   logger.info(`Comment deleted | user=${req.user._id} comment=${comment._id}`);

//   res.json({ success: true, message: "Comment deleted" });
// });
// /**
//  * @desc Like/Unlike a comment
//  * @route PUT /api/comments/:id/like
//  * @access Private
//  */
// const likeComment = asyncHandler(async (req, res) => {
//   const comment = await Comment.findById(req.params.id);

//   if (!comment) {
//     res.status(404);
//     throw new Error("Comment not found");
//   }

//   const userId = req.user._id.toString();
//   const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

//   if (alreadyLiked) {
//     comment.likes = comment.likes.filter((id) => id.toString() !== userId);
//   } else {
//     comment.likes.push(userId);
//   }

//   await comment.save();

//   const repliesCount = await Comment.countDocuments({ parent: comment._id });

//   res.json({
//     success: true,
//     message: alreadyLiked ? "Comment unliked" : "Comment liked",
//     data: {
//       ...comment.toObject(),
//       likesCount: comment.likes.length,
//       liked: !alreadyLiked,
//       repliesCount,
//     },
//   });
// });


// // ****************************************

// // ****************************************
// // @desc Reply to a comment
// // @route POST /api/comments/:id/reply
// // @access Private
// const replyToComment = asyncHandler(async (req, res) => {
//   const { text } = req.body;
//   const parentId = req.params.id;

//   const parentComment = await Comment.findById(parentId);
//   if (!parentComment) {
//     res.status(404);
//     throw new Error("Parent comment not found");
//   }

//   const reply = await Comment.create({
//     blog: parentComment.blog,   // same blog as parent
//     author: req.user._id,
//     text,
//     parent: parentId,
//   });

//   res.status(201).json({
//     success: true,
//     message: "Reply added successfully",
//     data: {
//       ...reply.toObject(),
//       likesCount: 0,
//       repliesCount: 0,
//     },
//   });
// });


// module.exports = {
//   addComment,
//   getComments,
//   getReplies,
//   updateComment,
//   deleteComment,
//   likeComment,
//   replyToComment,
// };

const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Blog = require("../models/Blog");

/**
 * @desc Add a comment to a blog
 * @route POST /api/comments/:blogId
 * @access Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { text, parent } = req.body;

  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // 🔒 Enforce comment toggle
  if (blog.commentsEnabled === false) {
    res.status(403);
    throw new Error("Comments are disabled for this blog");
  }

  const comment = await Comment.create({
    blog: blog._id,
    author: req.user._id,
    text: text.trim(),
    parent: parent || null,
  });

  await Blog.findByIdAndUpdate(blog._id, {
    $push: { comments: comment._id },
  });

  await comment.populate("author", "name email");

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: {
      ...comment.toObject(),
      likesCount: 0,
      repliesCount: 0,
    },
  });
});

/**
 * @desc Get all comments for a blog (nested)
 * @route GET /api/comments/:blogId
 * @access Public
 */
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ blog: req.params.blogId })
    .populate("author", "name email")
    .lean();

  const map = {};
  comments.forEach((c) => {
    map[c._id] = {
      ...c,
      children: [],
      likesCount: c.likes?.length || 0,
      repliesCount: 0,
    };
  });

  const roots = [];
  comments.forEach((c) => {
    if (c.parent) {
      if (map[c.parent]) {
        map[c.parent].children.push(map[c._id]);
        map[c.parent].repliesCount += 1;
      }
    } else {
      roots.push(map[c._id]);
    }
  });

  res.json({
    success: true,
    count: roots.length,
    data: roots,
  });
});


/**
 * @desc Update comment
 * @route PUT /api/comments/:id
 * @access Private
 */
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this comment");
  }

  comment.text = req.body.text || comment.text;
  const updated = await comment.save();

  const repliesCount = await Comment.countDocuments({ parent: updated._id });

  res.json({
    success: true,
    message: "Comment updated",
    data: {
      ...updated.toObject(),
      likesCount: updated.likes?.length || 0,
      repliesCount,
    },
  });
});

/**
 * @desc Delete comment (author OR blog owner)
 * @route DELETE /api/comments/:id
 * @access Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const blog = await Blog.findById(comment.blog);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const isCommentAuthor = comment.author.toString() === req.user._id.toString();
  const isBlogAuthor = blog.author.toString() === req.user._id.toString();

  if (!isCommentAuthor && !isBlogAuthor) {
    res.status(403);
    throw new Error(
      "You can only delete your own comments or comments on your blog"
    );
  }

  // 🔁 Recursive delete replies
  const deleteChildren = async (parentId) => {
    const children = await Comment.find({ parent: parentId });
    for (const child of children) {
      await deleteChildren(child._id);
      await Comment.findByIdAndDelete(child._id);
    }
  };

  await deleteChildren(comment._id);
  await Comment.findByIdAndDelete(comment._id);

  await Blog.findByIdAndUpdate(blog._id, {
    $pull: { comments: comment._id },
  });

  res.json({
    success: true,
    message: "Comment deleted successfully",
  });
});

/**
 * @desc Like / Unlike comment
 * @route PUT /api/comments/:id/like
 * @access Private
 */
const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const userId = req.user._id.toString();
  const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
  } else {
    comment.likes.push(userId);
  }

  await comment.save();

  const repliesCount = await Comment.countDocuments({ parent: comment._id });

  res.json({
    success: true,
    message: alreadyLiked ? "Comment unliked" : "Comment liked",
    data: {
      ...comment.toObject(),
      likesCount: comment.likes.length,
      liked: !alreadyLiked,
      repliesCount,
    },
  });
});

/**
 * @desc Reply to a comment
 * @route POST /api/comments/:id/reply
 * @access Private
 */
const replyToComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const parentId = req.params.id;

  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error("Reply text is required");
  }

  const parentComment = await Comment.findById(parentId);
  if (!parentComment) {
    res.status(404);
    throw new Error("Parent comment not found");
  }

  const blog = await Blog.findById(parentComment.blog);
  if (!blog || blog.commentsEnabled === false) {
    res.status(403);
    throw new Error("Comments are disabled for this blog");
  }

  const reply = await Comment.create({
    blog: parentComment.blog,
    author: req.user._id,
    text: text.trim(),
    parent: parentId,
  });

  res.status(201).json({
    success: true,
    message: "Reply added successfully",
    data: {
      ...reply.toObject(),
      likesCount: 0,
      repliesCount: 0,
    },
  });
});

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  replyToComment,
};

