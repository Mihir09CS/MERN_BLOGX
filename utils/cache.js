const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

// ---------- GENERIC CACHE ----------
const getCache = async (key) => {
  try {
    return await redis.get(key);
  } catch {
    return null; // fail-open
  }
};

const setCache = async (key, value, ttl = 60) => {
  try {
    await redis.set(key, value, { ex: ttl });
  } catch {
    // ignore cache failures
  }
};

const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(...keys);
    }
  } catch {
    // ignore cache failures
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCacheByPattern,
};
