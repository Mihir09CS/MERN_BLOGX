
// const express = require("express");
// const router = express.Router();
// const { protect } = require("../middlewares/authMiddleware");
// const { authorize } = require("../middlewares/roleMiddleware");
// const upload = require("../middlewares/uploadMiddleware");


// const {
//   getMe,
//   getMyProfile,
//   getPublicProfile,
//   updateMe,
//   updateMyProfile,
//   deleteMe,
//   getUsers,
//   getUserBlogs,
//   getUserById,
//   toggleFollow,
//   // followUser,
//   getMyFollowers,
//   getMyFollowing,
// } = require("../controllers/userController");

// // ==================== USER ROUTES ====================

// // Logged in user profile
// router.get("/me", protect, getMe);
// router.get("/me", protect, getMyProfile);
// router.put("/me", protect, upload.single("avatar"), updateMyProfile);
// router.delete("/me", protect, deleteMe);


// router.get("/:userId", getPublicProfile);
// router.get("/:id/blogs", getUserBlogs);

// // Update profile with avatar upload
// router.put("/me", protect, upload.single("avatar"), updateMe);


// // Followers / Following
// router.get("/me/followers", protect, getMyFollowers);
// router.get("/me/following", protect, getMyFollowing);

// // // Follow / Unfollow user
// // router.post("/:id/follow", protect, followUser);

// router.put("/:userId/follow", protect, toggleFollow);

// // Admin only - view all users
// router.get("/", protect, authorize("admin"), getUsers);

// // Public profile by ID
// router.get("/:id", getUserById);

// module.exports = router;


const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const {
  getMe,
  updateMe,
  deleteMe,
  getUsers,
  getUserById,
  getUserBlogs,
  getMyBookmarks,
} = require("../controllers/userController");

// Logged-in user
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);

// User content
router.get("/:id/blogs", getUserBlogs);

// Bookmarks
router.get("/me/bookmarks", protect, getMyBookmarks);

// Admin
router.get("/", protect, authorize("admin"), getUsers);

// Public user
router.get("/:id", getUserById);

module.exports = router;


