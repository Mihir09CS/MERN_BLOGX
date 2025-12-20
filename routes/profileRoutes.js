const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  toggleFollowProfile,
} = require("../controllers/profileController");

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.single("avatar"), updateMyProfile);

router.get("/:userId", getPublicProfile);
router.put("/:userId/follow", protect, toggleFollowProfile);

module.exports = router;
