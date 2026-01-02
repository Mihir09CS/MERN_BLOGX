// controllers/adminController.js
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");

const redis = require("../utils/upstashRedis");
const { getCache, setCache } = require("../utils/cache");
const { buildCacheKey, invalidateBlogCache } = require("../utils/cacheKey");

const logAdminAction = require("../utils/adminLogger");

const User = require("../models/User");
const Blog = require("../models/Blog");
const BlogReport = require("../models/BlogReport");
const AdminActionLog = require("../models/AdminActionLog");
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
  const { visibility, category } = req.query;
  const query = {};
  if (visibility) query.visibility = visibility;
  if (category) query.category = category;


  const blogs = await Blog.find(query).populate("author", "name email");
  res.json({ success: true, count: blogs.length, blogs });
});

//***************************************************************** 
// remove blog
const removeBlogAdmin = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.visibility === "removed") {
    return res.status(409).json({
      success: false,
      message: "Blog is already removed",
    });
  }

  blog.visibility = "removed";
  blog.removedAt = new Date();
  blog.removedBy = req.admin._id;

  await blog.save();
  await invalidateBlogCache();

  await logAdminAction({
    admin: req.admin._id,
    action: "BLOG_REMOVED",
    targetType: "Blog",
    targetId: blog._id,
    meta: { title: blog.title },
  });


  res.json({
    success: true,
    message: "Blog removed by admin",
  });
});


// Restore blog
const restoreBlogAdmin = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.visibility === "active") {
    return res.status(409).json({
      success: false,
      message: "Blog is already active",
    });
  }

  blog.visibility = "active";
  blog.removedAt = null;
  blog.removedBy = null;

  await blog.save();
  await invalidateBlogCache();


  await logAdminAction({
    admin: req.admin._id,
    action: "BLOG_RESTORED",
    targetType: "Blog",
    targetId: blog._id,
    meta: { title: blog.title },
  });

  res.json({
    success: true,
    message: "Blog restored successfully",
  });
});


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

  await logAdminAction({
    admin: req.admin._id,
    action: "USER_BANNED",
    targetType: "User",
    targetId: user._id,
    meta: { reason: user.banReason },
  });

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

  await logAdminAction({
    admin: req.admin._id,
    action: "USER_UNBANNED",
    targetType: "User",
    targetId: user._id,
  });


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

  await logAdminAction({
    admin: req.admin._id,
    action: "BLOG_DELETED",
    targetType: "Blog",
    targetId: blog._id,
    meta: { title: blog.title },
  });

  await invalidateBlogCache();

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
  await logAdminAction({
    admin: req.admin._id,
    action: "USER_DELETED",
    targetType: "User",
    targetId: user._id,
    meta: { cascade },
  });

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


// GET /api/admin/reports
// Query: status=pending|reviewed
const getBlogReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reports = await BlogReport.find(filter)
    .populate("blog", "title visibility")
    .populate("reporter", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reports.length,
    reports,
  });
});

// PATCH /api/admin/reports/:id/review
const reviewBlogReport = asyncHandler(async (req, res) => {
  const report = await BlogReport.findById(req.params.id).populate("blog");

  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }

  if (report.status === "reviewed") {
    return res.status(409).json({
      success: false,
      message: "Report already reviewed",
    });
  }

  // Optional: auto-remove blog if admin decides (manual UI trigger preferred)
  // Example (commented):
  // report.blog.visibility = "removed";
  // await report.blog.save();

  report.status = "reviewed";
  await report.save();
  await logAdminAction({
    admin: req.admin._id,
    action: "REPORT_REVIEWED",
    targetType: "Report",
    targetId: report._id,
    meta: { blogId: report.blog._id, reason: report.reason },
  });

  res.json({
    success: true,
    message: "Report marked as reviewed",
  });
});



const getAdminLogs = asyncHandler(async (req, res) => {
  const logs = await AdminActionLog.find()
    .populate("admin", "name email")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: logs.length,
    logs,
  });
});




// *****************************************************************
// 🛠 Analytics / Dashboard
// GET /api/admin/stats
const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalBlogs = await Blog.countDocuments();
  const totalComments = await Comment.countDocuments();
  const activeBlogs = await Blog.countDocuments({ visibility: "active" });
  const bannedUsers = await User.countDocuments({ isBanned: true });
  logger.info(`Admin ${req.admin._id} accessed dashboard stats`);

  res.json({
    success: true,
    stats: {
      totalUsers,
      bannedUsers,
      totalBlogs,
      activeBlogs,
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
  removeBlogAdmin,
  restoreBlogAdmin,
  deleteUserByAdmin,
  getAllBlogsAdmin,
  deleteBlogAdmin,
  getAllCommentsAdmin,
  deleteCommentAdmin,
  getBlogReports,
  reviewBlogReport,
  getAdminLogs,
  getAdminStats
};
