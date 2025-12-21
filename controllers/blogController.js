// controllers/blogController.js
const redis = require("../config/redis");
const buildCacheKey = require("../utils/cacheKey");
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");
const fs = require("fs");
const path = require("path");


// @desc Create new blog
// @route POST /api/blogs
// @access Private
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags, excerpt } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const blog = await Blog.create({
    title,
    content,
    excerpt: excerpt || content.substring(0, 200) + "...",
    author: req.user._id,
    category,
    tags: tags || [],
    coverImage: req.file ? `/uploads/blogs/${req.file.filename}` : undefined,
  });

  logger.info(`Blog created | user=${req.user._id} blog=${blog._id}`);

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

// @desc Get all blogs (with pagination, search, filter)
// @route GET /api/blogs
// @access Public
const getBlogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) query.$text = { $search: req.query.search };
  if (req.query.author) query.author = req.query.author;
  if (req.query.tag) query.tags = { $in: [req.query.tag] };
  if (req.query.category) query.category = req.query.category;

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate("author", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const blogsWithCounts = blogs.map((blog) => ({
    ...blog,
    likesCount: blog.likes?.length || 0,
  }));

  res.json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    blogs: blogsWithCounts,
  });
});

// @desc Get single blog + increment view
// @route GET /api/blogs/:id
// @access Public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate(
    "author",
    "name email"
  );

  if (!blog) {
    logger.warn(`Blog not found: ${req.params.id}`);
    res.status(404);
    throw new Error("Blog not found");
  }

  blog.views = (blog.views || 0) + 1;
  await blog.save();

  res.json({
    success: true,
    data: {
      ...blog.toObject(),
      likesCount: blog.likes?.length || 0,
    },
  });
});

// // *******************************************
// @desc Update blog with automatic old cover image deletion
// @route PUT /api/blogs/:id
// @access Private (author or admin)
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    logger.warn(`Update failed | blog not found ${req.params.id}`);
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.author.toString() !== req.user._id.toString()) {
    logger.warn(
      `Unauthorized blog update | user=${req.user._id} blog=${blog._id}`
    );
    res.status(403);
    throw new Error("Not authorized");
  }

  const { title, content, category, tags, excerpt } = req.body;
  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.excerpt = excerpt || blog.excerpt;
  blog.category = category || blog.category;
  blog.tags = tags || blog.tags;

  if (req.file && blog.coverImage) {
    const oldPath = path.join(__dirname, "..", blog.coverImage);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    blog.coverImage = `/uploads/blogs/${req.file.filename}`;
  }

  await blog.save();

  res.json({ success: true, message: "Blog updated", data: blog });
});// // *****************************************




// @desc Delete blog
// @route DELETE /api/blogs/:id

// DELETE BLOG (USER)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    logger.warn(`Delete failed | blog not found ${req.params.id}`);
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await blog.deleteOne();
  logger.info(`Blog deleted | user=${req.user._id} blog=${blog._id}`);

  res.json({ success: true, message: "Blog deleted" });
});

// @desc Like / Unlike blog
// @route PUT /api/blogs/:id/like
// @access Private
const likeBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (!blog.likes) blog.likes = [];
  const userId = req.user._id.toString();

  if (blog.likes.some((id) => id.toString() === userId)) {
    blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    await blog.save();
    return res.json({
      success: true,
      message: "Blog unliked",
      likesCount: blog.likes.length,
    });
  } else {
    blog.likes.push(userId);
    blog.dislikes = blog.dislikes.filter((id) => id.toString() !== userId);
    await blog.save();
    return res.json({
      success: true,
      message: "Blog liked",
      likesCount: blog.likes.length,
    });
  }
});

// @desc Dislike / Undislike blog
// @route PUT /api/blogs/:id/dislike
// @access Private
const dislikeBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (!blog.dislikes) blog.dislikes = [];
  const userId = req.user._id.toString();

  if (blog.dislikes.some((id) => id.toString() === userId)) {
    blog.dislikes = blog.dislikes.filter((id) => id.toString() !== userId);
    await blog.save();
    return res.json({
      success: true,
      message: "Blog undisliked",
      dislikesCount: blog.dislikes.length,
    });
  } else {
    blog.dislikes.push(userId);
    blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    await blog.save();
    return res.json({
      success: true,
      message: "Blog disliked",
      dislikesCount: blog.dislikes.length,
    });
  }
});

// @desc Bookmark / Unbookmark blog
// @route PUT /api/blogs/:id/bookmark
// @access Private
const bookmarkBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const user = req.user;
  const alreadyBookmarked = user.bookmarks.some(
    (id) => id.toString() === blog._id.toString()
  );

  if (alreadyBookmarked) {
    user.bookmarks = user.bookmarks.filter(
      (id) => id.toString() !== blog._id.toString()
    );
    await user.save();
    return res.json({ success: true, message: "Bookmark removed" });
  } else {
    user.bookmarks.push(blog._id);
    await user.save();
    return res.json({ success: true, message: "Blog bookmarked" });
  }
});

// @desc Get my blogs
// @route GET /api/blogs/me/blogs
// @access Private
const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ author: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, blogs });
});

// @desc Get my bookmarked blogs
// @route GET /api/blogs/me/bookmarks
// @access Private
const getBookmarkedBlogs = asyncHandler(async (req, res) => {
  const user = await req.user.populate({
    path: "bookmarks",
    populate: { path: "author", select: "name email" },
  });
  res.json({ success: true, bookmarks: user.bookmarks });
});

// @desc Get popular blogs
// @route GET /api/blogs/popular
// @access Public
const getPopularBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find()
    .populate("author", "name email")
    .sort({ views: -1, likes: -1 })
    .limit(10);

  const blogsWithCounts = blogs.map((blog) => ({
    ...blog.toObject(),
    likesCount: blog.likes?.length || 0,
  }));

  res.json({ success: true, blogs: blogsWithCounts });
});

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  bookmarkBlog,
  getMyBlogs,
  getBookmarkedBlogs,
  getPopularBlogs,
};
