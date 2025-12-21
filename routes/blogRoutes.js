 
const express = require("express");
const router = express.Router();

const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  bookmarkBlog,
  getMyBlogs,
  getBookmarkedBlogs,
  getPopularBlogs,
} = require("../controllers/blogController");

const { protectUser } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  createBlogValidator,
  updateBlogValidator,
} = require("../validators/blogValidators");
const validateObjectId = require("../middlewares/validateObjectId");

// Multer upload middleware
const upload = require("../middlewares/uploadMiddleware");

// ==================== BLOG ROUTES ====================

// Public routes
router.get("/", getBlogs);
router.get("/popular", getPopularBlogs);

// Private routes (must come BEFORE ":id")
router.get("/me/blogs", protectUser, getMyBlogs);


router.get("/me/bookmarks", protectUser, getBookmarkedBlogs);

// Single blog (public)
router.get("/:id", validateObjectId("id"), getBlogById);

// Create blog (private) with image upload
router.post(
  "/",
  protectUser,
  upload.single("coverImage"), // handle image
  createBlogValidator,
  validate,
  createBlog
);

// Update blog (private - author or admin) with optional image
router.put(
  "/:id",
  protectUser,
  validateObjectId("id"),
  upload.single("coverImage"),
  updateBlogValidator,
  validate,
  updateBlog
);

// Delete blog (private - author or admin)
router.delete("/:id", protectUser, validateObjectId("id"), deleteBlog);

// Like / Unlike blog (private)
router.put("/:id/like", protectUser, validateObjectId("id"), likeBlog);

// Dislike / Undislike blog (private)
router.put("/:id/dislike", protectUser, validateObjectId("id"), dislikeBlog);

// Bookmark / Unbookmark blog (private)
router.put("/:id/bookmark", protectUser, validateObjectId("id"), bookmarkBlog);

module.exports = router;
