
const asyncHandler = require("express-async-handler");
const Profile = require("../models/Profile");

// GET /api/profile/me
const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ user: req.user._id })
    .populate("user", "name email");

  // ✅ Auto-create profile if missing
  if (!profile) {
    profile = await Profile.create({
      user: req.user._id,
    });
  }

  res.json({ success: true, data: profile });
});


// PUT /api/profile/me
const updateMyProfile = asyncHandler(async (req, res) => {
  const { bio, socialLinks } = req.body;

  let profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
  }

  if (bio !== undefined) profile.bio = bio;
  if (socialLinks) profile.socialLinks = socialLinks;

  if (req.file) {
    profile.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  await profile.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: profile,
  });
});

// GET /api/profile/:userId
const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId }).populate(
    "user",
    "name"
  );

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json({ success: true, data: profile });
});

// PUT /api/profile/:userId/follow
const toggleFollowProfile = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const myUserId = req.user._id.toString();

  if (targetUserId === myUserId) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  // 🔹 Ensure my profile exists
  let myProfile = await Profile.findOne({ user: myUserId });
  if (!myProfile) {
    myProfile = await Profile.create({ user: myUserId });
  }

  // 🔹 Ensure target profile exists
  let targetProfile = await Profile.findOne({ user: targetUserId });
  if (!targetProfile) {
    targetProfile = await Profile.create({ user: targetUserId });
  }

  const isFollowing = myProfile.following.includes(targetUserId);

  if (isFollowing) {
    myProfile.following.pull(targetUserId);
    targetProfile.followers.pull(myUserId);
  } else {
    myProfile.following.push(targetUserId);
    targetProfile.followers.push(myUserId);
  }

  await myProfile.save();
  await targetProfile.save();

  res.json({
    success: true,
    message: isFollowing ? "Unfollowed user" : "Followed user",
  });
});


module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  toggleFollowProfile,
};
