const { deleteCacheByPattern } = require("./cache");

const invalidateBlogCache = async () => {
  await deleteCacheByPattern("blogs:*");
  await deleteCacheByPattern("blog:*");
};

module.exports = { invalidateBlogCache };
