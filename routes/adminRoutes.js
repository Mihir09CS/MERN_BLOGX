


// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../middlewares/authMiddleware");
const validateObjectId = require("../middlewares/validateObjectId");

const {
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
  getAdminStats,
} = require("../controllers/adminController");

// 🔐 Protect ALL admin routes
router.use(protectAdmin);

// ===== USERS =====
router.get("/users", getAllUsers);
router.get("/users/:id", validateObjectId("id"), getUserByIdAdmin);
router.patch("/users/:id/ban", validateObjectId("id"), banUser);
router.patch("/users/:id/unban", validateObjectId("id"), unbanUser);
router.delete("/users/:id", validateObjectId("id"), deleteUserByAdmin);

// ===== BLOGS =====
router.get("/blogs", getAllBlogsAdmin);
router.patch("/blogs/:id/publish", validateObjectId("id"), togglePublishBlog);
router.put("/blogs/:id/status", validateObjectId("id"), updateBlogStatus);
router.delete("/blogs/:id", validateObjectId("id"), deleteBlogAdmin);

// ===== COMMENTS =====
router.get("/comments", getAllCommentsAdmin);
router.delete("/comments/:id", validateObjectId("id"), deleteCommentAdmin);

// ===== STATS / DASHBOARD =====
router.get("/stats", getAdminStats);

module.exports = router;
