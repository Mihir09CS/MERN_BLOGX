// const { Redis } = require("@upstash/redis");

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// async function delPattern(pattern) {
//   const keys = await redis.keys(pattern);
//   if (keys.length > 0) {
//     await redis.del(keys);
//   }
// }


// module.exports = {redis,delPattern};
// utils/Redis.js
const { Redis } = require("@upstash/redis");

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("⚠️ Upstash Redis env vars missing. Redis disabled.");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = redis;
