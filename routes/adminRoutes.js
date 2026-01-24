
// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../middlewares/authMiddleware");
const validateObjectId = require("../middlewares/validateObjectId");
const requirePermission = require("../middlewares/requirePermission");

const {
  // USERS
  getAllUsers,
  getUserByIdAdmin,
  banUser,
  unbanUser,
  deleteUserByAdmin,

  // BLOGS
  getAllBlogsAdmin,
  removeBlogAdmin,
  restoreBlogAdmin,
  deleteBlogAdmin,

  // COMMENTS
  getAllCommentsAdmin,
  deleteCommentAdmin,

  // REPORTS
  getBlogReports,
  reviewBlogReport,

  // LOGS / STATS
  getAdminLogs,
  getAdminStats,
} = require("../controllers/adminController");

/* =====================================================
   🔐 GLOBAL ADMIN PROTECTION
===================================================== */
router.use(protectAdmin);

/* =====================================================
   👤 USERS
===================================================== */
router.get(
  "/users",
  requirePermission("MANAGE_USERS"),
  getAllUsers
);

router.get(
  "/users/:id",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  getUserByIdAdmin
);

router.patch(
  "/users/:id/ban",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  banUser
);

router.patch(
  "/users/:id/unban",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  unbanUser
);

router.delete(
  "/users/:id",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  deleteUserByAdmin
);

/* =====================================================
   📝 BLOGS
===================================================== */
router.get(
  "/blogs",
  requirePermission("MANAGE_BLOGS"),
  getAllBlogsAdmin
);

router.patch(
  "/blogs/:id/remove",
  validateObjectId("id"),
  requirePermission("MANAGE_BLOGS"),
  removeBlogAdmin
);

router.patch(
  "/blogs/:id/restore",
  validateObjectId("id"),
  requirePermission("MANAGE_BLOGS"),
  restoreBlogAdmin
);

router.delete(
  "/blogs/:id",
  validateObjectId("id"),
  requirePermission("MANAGE_BLOGS"),
  deleteBlogAdmin
);

/* =====================================================
   💬 COMMENTS
===================================================== */
router.get(
  "/comments",
  requirePermission("MANAGE_COMMENTS"),
  getAllCommentsAdmin
);

router.delete(
  "/comments/:id",
  validateObjectId("id"),
  requirePermission("MANAGE_COMMENTS"),
  deleteCommentAdmin
);

/* =====================================================
   🚨 REPORTS
===================================================== */
router.get(
  "/reports",
  requirePermission("MANAGE_REPORTS"),
  getBlogReports
);

router.patch(
  "/reports/:id/review",
  validateObjectId("id"),
  requirePermission("MANAGE_REPORTS"),
  reviewBlogReport
);

/* =====================================================
   📜 LOGS
===================================================== */
router.get(
  "/logs",
  requirePermission("VIEW_LOGS"),
  getAdminLogs
);

/* =====================================================
   📊 DASHBOARD / STATS
===================================================== */
router.get(
  "/stats",
  requirePermission("VIEW_LOGS"),
  getAdminStats
);

module.exports = router;
