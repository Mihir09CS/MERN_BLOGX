// controllers/blogController.js

const redis = require("../utils/upstashRedis");
const { getCache, setCache } = require("../utils/cache");
const { buildCacheKey, invalidateBlogCache } = require("../utils/cacheKey");


const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");
const Blog = require("../models/Blog");
const BlogReport = require("../models/BlogReport")
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

// @desc Get all blogs (with filters, search, sort)
// @route GET /api/blogs?search=react&category=Technology&sort=-views&page=1
// @access Public
const getBlogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // ✅ Get query parameters
  const { search, category, sort } = req.query;

  // ✅ Build dynamic filter
  const filter = { visibility: "active" };

  // Search in title and content
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // ✅ Build dynamic sort
  let sortQuery = { createdAt: -1 }; // default: newest first

  if (sort) {
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith("-") ? -1 : 1;
    sortQuery = { [sortField]: sortOrder };
  }

  // ✅ Cache key includes all filters
  const cacheKey = buildCacheKey("blogs", { page, search, category, sort });
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsedCache = typeof cached === "string" ? JSON.parse(cached) : cached;
    return res.json({
      ...parsedCache,
      source: "cache",
    });
  }

  // Fetch from DB with filters
  const total = await Blog.countDocuments(filter);
  const blogs = await Blog.find(filter)
    .populate("author", "name email")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .lean(); // Use lean for better performance

  const response = {
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    total,
    blogs: blogs.map((b) => ({
      ...b,
      likesCount: b.likes?.length || 0,
    })),
  };

  // Store in cache (shorter TTL for filtered results)
  await redis.set(cacheKey, JSON.stringify(response), { ex: 30 });

  res.json({
    ...response,
    source: "db",
  });
});


// @desc Get single blog (with Redis views)
// @route GET /api/blogs/:id
// @access Public
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
  { _id: req.params.id, visibility: "active" },
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
  const blog = await Blog.findOne({
    _id: req.params.id,
    visibility: "active",
  });

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
  const blogs = await Blog.find({ author: req.user._id })
    .select("+visibility")
    .sort({
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
  const blogs = await Blog.find({ visibility: "active" })
    .populate("author", "name email")
    .sort({ views: -1, likes: -1 })
    .limit(10);

  const blogsWithCounts = blogs.map((blog) => ({
    ...blog.toObject(),
    likesCount: blog.likes?.length || 0,
  }));

  res.json({ success: true, blogs: blogsWithCounts });
});


const reportBlog = asyncHandler(async (req, res) => {
  const { reason, message } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error("Report reason is required");
  }

  const blog = await Blog.findOne({
    _id: req.params.id,
    visibility: "active",
  });

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found or not active");
  }

  try {
    await BlogReport.create({
      blog: blog._id,
      reporter: req.user._id,
      reason,
      message,
    });
  } catch (err) {
 
    // Duplicate report protection
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this blog",
      });
    }
    throw err;
  }

  res.status(201).json({
    success: true,
    message: "Blog reported successfully",
  });
});


module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  reportBlog,
  bookmarkBlog,
  getMyBlogs,
  getBookmarkedBlogs,
  getPopularBlogs,
  buildCacheKey,
};
