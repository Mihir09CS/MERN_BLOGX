const redis = require("./upstashRedis");
const crypto = require("crypto");

// build cache key
const buildCacheKey = (prefix, params) => {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(params))
    .digest("hex");

  return `${prefix}:${hash}`;
};

// invalidate blog cache
const invalidateBlogCache = async () => {
  try {
    await redis.flushall(); // simple + safe
  } catch (err) {
    console.error("Cache invalidation failed:", err.message);
  }
};

module.exports = {
  buildCacheKey,
  invalidateBlogCache,
};
