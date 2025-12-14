// controllers/userController.js

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");


// @desc Get my profile
// @route GET /api/users/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ success: true, user });
});


// helper: generate full file URL
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  return `${req.protocol}://${req.get("host")}${filePath}`;
};

// @desc    Update logged-in user's profile (name, email, password, bio, avatar)
// @route   PUT /api/users/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ✅ Update only if provided
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.bio = req.body.bio || user.bio;

  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password; // your User schema should handle hashing
  }

  // ✅ Handle avatar upload
  if (req.file) {
    // delete old avatar if it exists locally
    if (user.avatar) {
      const oldAvatarPath = path.join(process.cwd(), "uploads", "avatars", path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // save new avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: getFileUrl(req, updatedUser.avatar),
    },
  });
});



// *******************************

// @desc Delete my account
// @route DELETE /api/users/me
// @access Private
const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

// @desc Get all users (Admin only)
// @route GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, users });
});

// @desc Get user by ID (Public Profile)
// @route GET /api/users/:id
// @access Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user });
});

// @desc Follow / Unfollow
// @route POST /api/users/:id/follow
// @access Private
const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);

  if (!userToFollow) {
    res.status(404);
    throw new Error("User not found");
  }

  if (userToFollow._id.equals(currentUser._id)) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const isFollowing = userToFollow.followers.some(
    (id) => id.toString() === currentUser._id.toString()
  );

  if (isFollowing) {
    userToFollow.followers.pull(currentUser._id);
    currentUser.following.pull(userToFollow._id);
    await userToFollow.save();
    await currentUser.save();
    return res.json({ success: true, message: "Unfollowed successfully" });
  } else {
    userToFollow.followers.push(currentUser._id);
    currentUser.following.push(userToFollow._id);
    await userToFollow.save();
    await currentUser.save();
    return res.json({ success: true, message: "Followed successfully" });
  }
});

// @desc Get my followers
// @route GET /api/users/me/followers
// @access Private
const getMyFollowers = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).populate(
    "followers",
    "name email avatar"
  );
  res.json({ success: true, followers: me.followers });
});

// @desc Get my following
// @route GET /api/users/me/following
// @access Private
const getMyFollowing = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).populate(
    "following",
    "name email avatar"
  );
  res.json({ success: true, following: me.following });
});

// @desc Get my bookmarks
// @route GET /api/users/me/bookmarks
// @access Private
const getMyBookmarks = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user._id).populate({
    path: "bookmarks",
    populate: { path: "author", select: "name email" },
  });
  res.json({ success: true, bookmarks: me.bookmarks });
});


module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getUsers,
  getUserById,
  followUser,
  getMyFollowers,
  getMyFollowing,
  getMyBookmarks,
};
