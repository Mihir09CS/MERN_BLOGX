const express = require("express");
const router = express.Router();

const { protectUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  toggleFollowProfile,
  getMyFollowers,
  getMyFollowing,
  getFollowers,
  getFollowing,
} = require("../controllers/profileController");

// =======================
// ME ROUTES (STATIC FIRST)
// =======================

router.get("/me", protectUser, getMyProfile);
router.put("/me", protectUser, updateMyProfile);

router.get("/me/followers", protectUser, getMyFollowers);
router.get("/me/following", protectUser, getMyFollowing);

// =======================
// PUBLIC USER ROUTES (DYNAMIC LAST)
// =======================

router.get("/:userId", getPublicProfile);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);
router.put("/:userId/follow", protectUser, toggleFollowProfile);

module.exports = router;
