const { createHash } = require("node:crypto");

const buildCacheKey = (prefix, query) => {
  const hash = createHash("md5").update(JSON.stringify(query)).digest("hex");

  return `${prefix}:${hash}`;
};

module.exports = buildCacheKey;
