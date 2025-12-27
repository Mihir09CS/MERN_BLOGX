const { createHash } = require("node:crypto");
const redis = require("../utils/redis")

const buildCacheKey = (prefix, query) => {
  const hash = createHash("md5").update(JSON.stringify(query)).digest("hex");

  return `${prefix}:${hash}`;
};

// increments version to invalidate all blog caches
const invalidateBlogCache = async () => {
  await redis.incr("blogs:version");
};
module.exports = {
  buildCacheKey,
  invalidateBlogCache,
  };
