
const jwt = require("jsonwebtoken");

const generateToken = (id, type = "user") => {
  return jwt.sign(
    { id, type }, // type = "user" | "admin"
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

module.exports = generateToken;

