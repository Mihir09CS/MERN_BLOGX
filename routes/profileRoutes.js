const express = require("express");
const router = express.Router();

const { protectUser } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  toggleFollowProfile,
} = require("../controllers/profileController");

router.get("/me", protectUser, getMyProfile);
router.put("/me", protectUser, upload.single("avatar"), updateMyProfile);

router.get("/:userId", getPublicProfile);
router.put("/:userId/follow", protectUser, toggleFollowProfile);

module.exports = router;
