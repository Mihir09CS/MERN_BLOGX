// // middlewares/errorMiddleware.js
// const notFound = (req, res, next) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);
//   res.status(404);
//   next(error);
// };

// const errorHandler = (err, req, res, next) => {
//   // If response status set earlier (e.g., 400,401), keep it; otherwise default 500
//   const statusCode =
//     res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

//   res.status(statusCode).json({
//     success: false,
//     message: err.message || "Server Error",
//     // In production hide stack
//     stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
//   });
// };

// module.exports = { notFound, errorHandler };


const logger = require("../utils/logger");

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // 🔥 Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    user: req.user ? req.user._id : null,
    admin: req.admin ? req.admin._id : null,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
