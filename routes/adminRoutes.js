


// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../middlewares/authMiddleware");
const validateObjectId = require("../middlewares/validateObjectId");
const requirePermission = require("../middlewares/requirePermission")

const {
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
  getAdminStats,
} = require("../controllers/adminController");

// 🔐 Protect ALL admin routes
router.use(protectAdmin);

// ===== USERS =====
router.get("/users", requirePermission("MANAGE_USERS"), getAllUsers);
router.get("/users/:id", validateObjectId("id"), getUserByIdAdmin);
router.patch("/users/:id/ban", validateObjectId("id"),requirePermission("MANAGE_USERS"), banUser);
router.patch("/users/:id/ban", validateObjectId("id"),requirePermission("MANAGE_USERS"), banUser);
router.patch("/users/:id/ban", validateObjectId("id"),requirePermission("MANAGE_USERS"), banUser);
router.patch(
  "/users/:id/ban",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  banUser
);
router.patch(
  "/users/:id/ban",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  banUser
);
router.patch(
  "/users/:id/ban",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  banUser
);
router.patch(
  "/users/:id/ban",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  banUser
);
router.patch("/users/:id/ban", validateObjectId("id"),requirePermission("MANAGE_USERS"), banUser);
router.patch("/users/:id/unban", validateObjectId("id"),requirePermission("MANAGE_USERS"), unbanUser);
router.delete(
  "/users/:id",
  validateObjectId("id"),
  requirePermission("MANAGE_USERS"),
  deleteUserByAdmin
);

// ===== BLOGS =====
router.get("/blogs", requirePermission("MANAGE_BLOGS"), getAllBlogsAdmin);
router.patch(
  "/blogs/:id/remove",
  validateObjectId("id"),
  requirePermission("MANAGE_BLOGS"),
  removeBlogAdmin
);

router.patch(
  "/blogs/:id/restore",
  requirePermission("MANAGE_BLOGS"),
  validateObjectId("id"),
  restoreBlogAdmin
);
router.delete(
  "/blogs/:id",
  validateObjectId("id"),
  requirePermission("MANAGE_BLOGS"),
  deleteBlogAdmin
);

// ===== VIEW LOGS =====
router.get("/logs", requirePermission("VIEW_LOGS"), getAdminLogs);

// ===== COMMENTS =====
router.get(
  "/comments",
  requirePermission("MANAGE_COMMENTS"),
  getAllCommentsAdmin
);
router.delete(
  "/comments/:id",
  requirePermission("MANAGE_COMMENTS"),
  validateObjectId("id"),
  deleteCommentAdmin
);

router.get("/reports", requirePermission("MANAGE_REPORTS"), getBlogReports);
router.patch(
  "/reports/:id/review",
  requirePermission("MANAGE_REPORTS"),
  validateObjectId("id"),
  reviewBlogReport
);

// ===== STATS / DASHBOARD =====
router.get("/stats", getAdminStats);

module.exports = router;
