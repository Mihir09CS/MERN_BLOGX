
const express = require("express");
const router = express.Router();

const { protectUser } = require("../middlewares/authMiddleware");


const {
  getMe,
  updateMe,
  deleteMe,
  getUserById,
  getUserBlogs,
  getMyBookmarks,
} = require("../controllers/userController");

// Logged-in user
router.get("/me", protectUser, getMe);
router.put("/me", protectUser, updateMe);
router.delete("/me", protectUser, deleteMe);
// Bookmarks
router.get("/me/bookmarks", protectUser, getMyBookmarks);



// Public user
router.get("/:id", getUserById);
// User content
router.get("/:id/blogs", getUserBlogs);


module.exports = router;


