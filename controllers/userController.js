
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Blog = require("../models/Blog");

// GET /api/users/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ success: true, data: user });
});

// PUT /api/users/me
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  await user.save();

  res.json({
    success: true,
    message: "Account updated successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// DELETE /api/users/me
const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: "Account deleted successfully" });
});

// GET /api/users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, data: users });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

// GET /api/users/:id/blogs
const getUserBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ author: req.params.id })
    .sort({ createdAt: -1 })
    .populate("author", "name email");

  res.json({ success: true, data: blogs });
});



// GET /api/users/me/bookmarks
const getMyBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "bookmarks",
    populate: { path: "author", select: "name email" },
  });

  res.json({ success: true, data: user.bookmarks });
});

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getUsers,
  getUserById,
  getUserBlogs,
  getMyBookmarks,
};
