

const authRateLimiter = ({
  windowSeconds = 900,
  maxRequests = 5,
  prefix = "auth",
}) => {
  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "unknown";

      const key = `${prefix}:${ip}`;

      const current = await redis.get(key);

      if (!current) {
        await redis.set(key, 1, { ex: windowSeconds });
      } else {
        const count = await redis.incr(key);
        if (count > maxRequests) {
          return res.status(429).json({
            message: "Too many attempts. Please try again later.",
          });
        }
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // fail-open
    }
  };
};

module.exports = authRateLimiter;
