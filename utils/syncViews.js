const redis = require("../config/redis");
const Blog = require("../models/Blog");
const logger = require("./logger");

const syncBlogViews = async () => {
  const keys = await redis.keys("blog:views:*");

  for (const key of keys) {
    const blogId = key.split(":")[2];
    const views = parseInt(await redis.get(key), 10);

    if (views > 0) {
      await Blog.findByIdAndUpdate(blogId, {
        $inc: { views },
      });

      await redis.del(key);

      logger.info(`Synced views for blog ${blogId}: +${views}`);
    }
  }
};

module.exports = syncBlogViews;
