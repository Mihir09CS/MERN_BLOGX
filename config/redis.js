const Redis = require("ioredis");
const logger = require("../utils/logger");

const redis = new Redis(
  process.env.REDIS_URL || {
    host: "127.0.0.1",
    port: 6379,
  }
);

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error("Redis error", err);
});

module.exports = redis;
