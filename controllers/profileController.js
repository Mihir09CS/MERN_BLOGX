
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
  const { bio, socialLinks, avatar } = req.body;

  let profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
  }

  if (bio !== undefined) profile.bio = bio;
  if (socialLinks) profile.socialLinks = socialLinks;

  // ImageKit avatar update
  if (avatar?.url && avatar?.fileId) {
    // delete old avatar from ImageKit
    if (profile.avatar?.fileId) {
      try {
        await imagekit.deleteFile(profile.avatar.fileId);
      } catch (err) {
        console.warn("Old avatar delete failed");
      }
    }

    profile.avatar = avatar;
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

  res.json({
    success: true,
    data: {
      ...profile.toObject(),
      followersCount: profile.followers.length,
      followingCount: profile.following.length,
    },
  });

});

// PUT /api/profile/:userId/follow
const toggleFollowProfile = asyncHandler(async (req, res) => {
  const myUserId = req.user._id;
  const targetUserId = req.params.userId;

  if (myUserId.equals(targetUserId)) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  let myProfile = await Profile.findOne({ user: myUserId });
  if (!myProfile) myProfile = await Profile.create({ user: myUserId });

  let targetProfile = await Profile.findOne({ user: targetUserId });
  if (!targetProfile)
    targetProfile = await Profile.create({ user: targetUserId });

  const isFollowing = myProfile.following.some((id) => id.equals(targetUserId));

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

// GET /api/profile/me/following
const getMyFollowing = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }).populate({
    path: "following",
    select: "name email",
  });

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json({
    success: true,
    count: profile.following.length,
    data: profile.following,
  });
});


// GET /api/profile/me/followers
const getMyFollowers = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id })
    .populate("followers", "name email");

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json({
    success: true,
    count: profile.followers.length,
    data: profile.followers,
  });
});


// Get public followers
// GET /api/profile/:userId/followers
const getFollowers = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId })
    .populate("followers", "name email");

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json({
    success: true,
    count: profile.followers.length,
    data: profile.followers,
  });
});

// ✅ Get public following
// GET /api/profile/:userId/following
const getFollowing = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId })
    .populate("following", "name email");

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  res.json({
    success: true,
    count: profile.following.length,
    data: profile.following,
  });
});


module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  toggleFollowProfile,
  getMyFollowing,
  getMyFollowers,
  getFollowers,
  getFollowing,
};
