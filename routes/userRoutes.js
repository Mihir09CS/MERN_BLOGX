
// const express = require("express");
// const router = express.Router();
// const { protect } = require("../middlewares/authMiddleware");
// const { authorize } = require("../middlewares/roleMiddleware");
// const {
//   getMe,
//   updateMe,
//   deleteMe,
//   getUsers,
//   getUserById,
//   followUser,
//   getMyFollowers,
//   getMyFollowing,
//   bookmarkBlog,
//   getMyBookmarks,
// } = require("../controllers/userController");

// // Logged in user profile
// router.get("/me", protect, getMe);
// router.put("/me", protect, updateMe);
// router.delete("/me", protect, deleteMe);

// // Admin only - view all users
// router.get("/", protect, authorize("admin"), getUsers);

// // Public profile
// router.get("/:id", getUserById);

// // Follow / unfollow user
// router.post("/:id/follow", protect, followUser);

// // Followers / Following
// router.get("/me/followers", protect, getMyFollowers);
// router.get("/me/following", protect, getMyFollowing);

// // Bookmarks
// router.post("/bookmark/:blogId", protect, bookmarkBlog);
// router.get("/me/bookmarks", protect, getMyBookmarks);

// module.exports = router;



const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");


const {
  getMe,
  updateMe,
  deleteMe,
  getUsers,
  getUserById,
  followUser,
  getMyFollowers,
  getMyFollowing,
} = require("../controllers/userController");

// ==================== USER ROUTES ====================

// Logged in user profile
router.get("/me", protect, getMe);
// router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);


// Update profile with avatar upload
router.put("/me", protect, upload.single("avatar"), updateMe);

// Followers / Following
router.get("/me/followers", protect, getMyFollowers);
router.get("/me/following", protect, getMyFollowing);

// Follow / Unfollow user
router.post("/:id/follow", protect, followUser);

// Admin only - view all users
router.get("/", protect, authorize("admin"), getUsers);

// Public profile by ID
router.get("/:id", getUserById);

module.exports = router;

