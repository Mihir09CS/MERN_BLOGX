
// const express = require("express");
// const router = express.Router();
// const { protectUser } = require("../middlewares/authMiddleware");
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
// router.get("/me", protectUser, getMe);
// router.get("/me", protectUser, getMyProfile);
// router.put("/me", protectUser, upload.single("avatar"), updateMyProfile);
// router.delete("/me", protectUser, deleteMe);


// router.get("/:userId", getPublicProfile);
// router.get("/:id/blogs", getUserBlogs);

// // Update profile with avatar upload
// router.put("/me", protectUser, upload.single("avatar"), updateMe);


// // Followers / Following
// router.get("/me/followers", protectUser, getMyFollowers);
// router.get("/me/following", protectUser, getMyFollowing);

// // // Follow / Unfollow user
// // router.post("/:id/follow", protectUser, followUser);

// router.put("/:userId/follow", protectUser, toggleFollow);

// // Admin only - view all users
// router.get("/", protectUser, authorize("admin"), getUsers);

// // Public profile by ID
// router.get("/:id", getUserById);

// module.exports = router;


const express = require("express");
const router = express.Router();

const { protectUser } = require("../middlewares/authMiddleware");


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
router.get("/me", protectUser, getMe);
router.put("/me", protectUser, updateMe);
router.delete("/me", protectUser, deleteMe);

// User content
router.get("/:id/blogs", getUserBlogs);

// Bookmarks
router.get("/me/bookmarks", protectUser, getMyBookmarks);



// Public user
router.get("/:id", getUserById);

module.exports = router;


