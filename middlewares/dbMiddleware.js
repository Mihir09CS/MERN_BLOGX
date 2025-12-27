const connectDB = require("../config/db");

const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({
      success: false,
      message: "Database connection error",
    });
  }
};

module.exports = ensureDB;
