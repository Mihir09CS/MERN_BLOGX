// controllers/adminController.js
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Blog = require("../models/Blog");
// **
const Comment = require("../models/Comment");
// **

// GET /api/admin/users
// Query: page, limit, search, role, banned(true|false), sort (e.g. -createdAt,name)
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  const { search, role, banned } = req.query;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) filter.role = role;
  if (typeof banned !== "undefined") {
    const val = ["true", "1", true].includes(banned);
    filter.isBanned = val;
  }

  // sort parsing: "-createdAt,name" -> { createdAt: -1, name: 1 }
  let sort = { createdAt: -1 };
  if (req.query.sort) {
    sort = {};
    req.query.sort.split(",").forEach((k) => {
      k = k.trim();
      if (!k) return;
      if (k.startsWith("-")) sort[k.slice(1)] = -1;
      else sort[k] = 1;
    });
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select("-password")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    users,
  });
});

//***************************************************************** 
// 1️⃣ Get All Blogs (with filters)
// GET /api/admin/blogs?isPublished=true&category=Tech
const getAllBlogsAdmin = asyncHandler(async (req, res) => {
  const { isPublished, category } = req.query;
  const query = {};
  if (isPublished !== undefined) query.isPublished = isPublished === "true";
  if (category) query.category = category;

  const blogs = await Blog.find(query).populate("author", "name email");
  res.json({ success: true, count: blogs.length, blogs });
});

//***************************************************************** 




// GET /api/admin/users/:id
const getUserByIdAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "name email")
    .populate("following", "name email")
    .populate({
      path: "bookmarks",
      select: "title author createdAt",
      populate: { path: "author", select: "name email" },
    });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, user });
});




//***************************************************************** 
// 2️⃣ Approve / Unpublish Blog
// PATCH /api/admin/blogs/:id/publish

const togglePublishBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.isPublished = !blog.isPublished;
  await blog.save();

  res.json({ success: true, message: `Blog ${blog.isPublished ? "published" : "unpublished"} successfully` });
});

//***************************************************************** 

// @desc    Update blog status (approve/reject/publish)
// @route   PUT /api/admin/blogs/:id/status
// @access  Private/Admin
const updateBlogStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // expected: "approved", "rejected", "published"
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.status = status;
  await blog.save();

  res.json({ message: "Blog status updated", blog });
});

//***************************************************************** 

// PATCH /api/admin/users/:id/ban
// body: { reason?: string }
const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.isBanned) {
    return res.json({ success: true, message: "User already banned" });
  }

  user.isBanned = true;
  user.bannedAt = new Date();
  user.banReason = reason || "Policy violation";
  await user.save();
  logger.warn(
    `Admin ${req.admin._id} banned user ${user._id}, reason=${user.banReason}`
  );

  res.json({
    success: true,
    message: "User banned",
    bannedAt: user.bannedAt,
    banReason: user.banReason,
  });
});

// PATCH /api/admin/users/:id/unban
const unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (!user.isBanned) {
    return res.json({ success: true, message: "User is not banned" });
  }

  user.isBanned = false;
  user.bannedAt = null;
  user.banReason = null;
  await user.save();

  res.json({ success: true, message: "User unbanned" });
});

//*****************************************************************
// 3️⃣ Delete Any Blog
// DELETE /api/admin/blogs/:id
const deleteBlogAdmin = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  await blog.deleteOne();
  logger.warn(`Admin ${req.admin._id} deleted blog ${blog._id}`);

  res.json({ success: true, message: "Blog deleted by admin" });
});


//*****************************************************************

// DELETE /api/admin/users/:id?cascade=true
// cascade=true also deletes their blogs
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { cascade } = req.query;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (["admin"].includes(user.role)) {
    res.status(403);
    throw new Error("Cannot delete another admin");
  }

  if (cascade === "true") {
    await Blog.deleteMany({ author: user._id });
  }

  await user.deleteOne();
  logger.warn(
    `Admin ${req.admin._id} deleted user ${user._id}, cascade=${cascade}`
  );

  res.json({
    success: true,
    message: "User deleted",
    cascade: cascade === "true",
  });
});

//*****************************************************************
// 1️⃣ Get All Comments
// GET /api/admin/comments
const getAllCommentsAdmin = asyncHandler(async (req, res) => {
  const comments = await Comment.find()
    .populate("author", "name email")
    .populate("blog", "title");
  res.json({ success: true, count: comments.length, comments });
});

//*****************************************************************

// 2️⃣ Delete Any Comment
// DELETE /api/admin/comments/:id
const deleteCommentAdmin = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  await comment.deleteOne();
  res.json({ success: true, message: "Comment deleted by admin" });
});

// *****************************************************************
// 🛠 Analytics / Dashboard
// GET /api/admin/stats
const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalBlogs = await Blog.countDocuments();
  const totalComments = await Comment.countDocuments();
  const publishedBlogs = await Blog.countDocuments({ isPublished: true });
  const bannedUsers = await User.countDocuments({ isBanned: true });
  logger.info(`Admin ${req.admin._id} accessed dashboard stats`);

  res.json({
    success: true,
    stats: {
      totalUsers,
      bannedUsers,
      totalBlogs,
      publishedBlogs,
      totalComments,
    },
  });
});


//*****************************************************************

module.exports = {
  getAllUsers,
  getUserByIdAdmin,
  banUser,
  unbanUser,
  deleteUserByAdmin,
  getAllBlogsAdmin,
  togglePublishBlog,
  updateBlogStatus,
  deleteBlogAdmin,
  getAllCommentsAdmin,
  deleteCommentAdmin,
  getAdminStats
};
