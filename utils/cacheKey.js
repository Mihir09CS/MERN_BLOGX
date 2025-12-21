const crypto = require("crypto");

const buildCacheKey = (prefix, query) => {
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(query))
    .digest("hex");

  return `${prefix}:${hash}`;
};

module.exports = buildCacheKey;
