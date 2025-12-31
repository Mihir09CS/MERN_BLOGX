const redis = require("../utils/upstashRedis");

const authRateLimiter = ({ windowSeconds = 900, maxRequests = 10, prefix }) => {
  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

      const key = `${prefix}:${ip}`;  

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Try again later.",
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // fail-open
    }
  };
};

module.exports = authRateLimiter;
