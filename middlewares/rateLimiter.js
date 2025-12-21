const redis = require("../config/redis");

const authRateLimiter = ({
  windowSeconds = 900, // 15 minutes
  maxRequests = 5, // max attempts
  prefix = "auth",
}) => {
  return async (req, res, next) => {
    try {
      const identifier = req.ip || req.headers["x-forwarded-for"] || "unknown";

      const key = `${prefix}:${identifier}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        return res.status(429).json({
          message: "Too many attempts. Please try again later.",
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next(); // fail-open (do not block auth)
    }
  };
};

module.exports = authRateLimiter;
