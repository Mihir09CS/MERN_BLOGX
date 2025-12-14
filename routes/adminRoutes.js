


// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { protect ,admin} = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const validateObjectId = require("../middlewares/validateObjectId");

const {
  getAllUsers,
  getUserByIdAdmin,
  updateUserRole,
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

// All admin routes require auth + admin role
router.use(protect, authorize("admin"));

// ===== USERS =====
router.get("/users", getAllUsers);
router.get("/users/:id", validateObjectId("id"), getUserByIdAdmin);
router.patch("/users/:id/role", validateObjectId("id"), updateUserRole);
router.patch("/users/:id/ban", validateObjectId("id"), banUser);
router.patch("/users/:id/unban", validateObjectId("id"), unbanUser);
router.delete("/users/:id", validateObjectId("id"), deleteUserByAdmin);

// ===== BLOGS =====
router.get("/blogs", getAllBlogsAdmin);
router.patch("/blogs/:id/publish", validateObjectId("id"), togglePublishBlog);
router.delete("/blogs/:id", validateObjectId("id"), deleteBlogAdmin);

// Approve / reject / change status (no extra protect/admin here — already applied above)
router.put("/blogs/:id/status", validateObjectId("id"), updateBlogStatus);

// ===== COMMENTS =====
router.get("/comments", getAllCommentsAdmin);
router.delete("/comments/:id", validateObjectId("id"), deleteCommentAdmin);

// ===== STATS / DASHBOARD =====
router.get("/stats", getAdminStats);

module.exports = router;
