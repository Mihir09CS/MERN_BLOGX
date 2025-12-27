// controllers/blogController.js

const redis = require("../utils/redis");
const { buildCacheKey, invalidateBlogCache } = require("../utils/cacheKey");
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");
const imagekit = require("../utils/imageKit");
const sharp = require("sharp");


const safeJsonParse = (value, fallback) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value ?? fallback;
};

// @desc Create new blog
// @route POST /api/blogs
// @access Private
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags, excerpt } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  let coverImage = null;

  if (req.file) {
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1280 })
      .jpeg({ quality: 75 })
      .toBuffer();

    const uploadResult = await imagekit.upload({
      file: optimizedBuffer.toString("base64"),
      fileName: `blog-${Date.now()}.jpg`,
      folder: "/blogs",
    });

    coverImage = {
      url: uploadResult.url,
      fileId: uploadResult.fileId,
    };
  }

  const blog = await Blog.create({
    title,
    content,
    excerpt: excerpt || content.substring(0, 200) + "...",
    author: req.user._id,
    category,
    tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
    coverImage,
  });

  await invalidateBlogCache();

  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

// @desc Get all blogs (with Redis cache)
// @route GET /api/blogs
// @access Public
const getBlogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const version = (await redis.get("blogs:version")) || 1;

  const cacheKey = buildCacheKey("blogs", {
    version,
    page,
    limit,
    query: req.query,
  });

  // 🔹 1. READ FROM CACHE (DO NOT PARSE TWICE)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({
      ...cached, // 🔥 cached is ALREADY an object
      source: "cache",
    });
  }

  // 🔹 2. BUILD QUERY
  const query = {};

  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  if (req.query.author) {
    query.author = req.query.author;
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.tag) {
    query.tags = { $in: [req.query.tag] };
  }

  // 🔹 3. DB QUERY
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

  const response = {
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    blogs: blogsWithCounts,
  };

  // 🔹 4. SAVE TO CACHE (STRINGIFY ONCE)
  await redis.set(cacheKey, response);

  res.json({
    ...response,
    source: "db",
  });
});

// @desc Get single blog (with Redis views)
// @route GET /api/blogs/:id
// @access Public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("author", "name email");

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  res.json({
    success: true,
    source: "db",
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
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { title, content, category, tags, excerpt } = req.body;

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.excerpt = excerpt || blog.excerpt;
  blog.category = category || blog.category;
  blog.tags = tags
    ? typeof tags === "string"
      ? JSON.parse(tags)
      : tags
    : blog.tags;

  // 🔥 ImageKit logic
  if (req.file) {
    // delete old image from ImageKit
    if (blog.coverImage?.fileId) {
      await imagekit.deleteFile(blog.coverImage.fileId);
    }

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1280 })
      .jpeg({ quality: 75 })
      .toBuffer();

    const uploadResult = await imagekit.upload({
      file: optimizedBuffer.toString("base64"),
      fileName: `blog-${Date.now()}.jpg`,
      folder: "/blogs",
    });

    blog.coverImage = {
      url: uploadResult.url,
      fileId: uploadResult.fileId,
    };
  }

  await blog.save();
  // clear all blog list caches
  await redis.delPattern("blogs:*");

  await invalidateBlogCache();

  res.json({
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});

// @desc Delete blog
// @route DELETE /api/blogs/:id

// DELETE BLOG (USER)
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // 🔥 Delete ImageKit file
  if (blog.coverImage?.fileId) {
    await imagekit.deleteFile(blog.coverImage.fileId);
  }

  await blog.deleteOne();

  await invalidateBlogCache();

  res.json({
    success: true,
    message: "Blog deleted successfully",
  });
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

  const userId = req.user._id.toString();
  const liked = blog.likes.includes(userId);

  if (liked) {
    blog.likes.pull(userId);
  } else {
    blog.likes.push(userId);
    blog.dislikes.pull(userId);
  }

  await blog.save();

  // 🔥 REQUIRED
  await invalidateBlogCache();

  res.json({
    success: true,
    message: liked ? "Blog unliked" : "Blog liked",
    likesCount: blog.likes.length,
  });
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

  const userId = req.user._id.toString();
  const disliked = blog.dislikes.includes(userId);

  if (disliked) {
    blog.dislikes.pull(userId);
  } else {
    blog.dislikes.push(userId);
    blog.likes.pull(userId);
  }

  await blog.save();

  // 🔥 REQUIRED
  await invalidateBlogCache();

  res.json({
    success: true,
    message: disliked ? "Blog undisliked" : "Blog disliked",
  });
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
  buildCacheKey,
};
