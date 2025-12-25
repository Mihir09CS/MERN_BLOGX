
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const uploadRoutes =require("./routes/uploadRoutes");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const requestLogger = require("./middlewares/loggerMiddleware");

const app = express();

// trust proxy (required for rate limiting)
app.set("trust proxy", 1);

// connect DB
connectDB();

// parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// security
app.use(helmet());
app.use(mongoSanitize());

// cors
app.use(
  cors({
    origin: ["http://localhost:5173", "https://mern-blogx.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

// errors
app.use(notFound);
app.use(errorHandler);

// ✅ EXPORT ONLY
module.exports = app;
