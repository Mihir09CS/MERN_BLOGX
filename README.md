📝 Blog App – Backend API

A production-ready backend for a modern blog application built with Node.js, Express, MongoDB, and Redis, featuring secure authentication, email verification, caching, and rate limiting.

🚀 Features Overview
🔐 Authentication & Security

User registration & login (JWT)

Email OTP verification (hashed & expiry-based)

Welcome email after verification

Forgot & reset password

Redis-based auth rate limiting

Separate Admin authentication & permissions

🧑‍💻 User & Profile

User profile management

Avatar upload

Follow / unfollow users

Followers & following

User bookmarks

📝 Blog Management

Create, read, update, delete blogs

Categories & tags

Blog cover image upload

Like / dislike blogs

Bookmark blogs

Popular blogs

Pagination & filtering

💬 Comments System

Add comments to blogs

Reply to comments (nested structure)

Like / dislike comments

Update & delete comments

⚡ Performance & Scalability

Redis caching (blogs & views)

Cache invalidation on write operations

Redis-based rate limiting

Optimized DB queries

📧 Email System

Transactional emails via Brevo (Sendinblue)

OTP verification emails

Welcome emails

Password reset emails

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

Cache & Rate Limiting: Redis

Authentication: JWT, bcrypt

Email: Brevo SMTP API

File Uploads: Multer

Logging: Winston

Validation: express-validator

📁 Folder Structure
backend/
│
├── config/
│   ├── db.js                 # MongoDB connection
│   └── redis.js              # Redis connection
│
├── controllers/
│   ├── adminAuthController.js
│   ├── adminController.js
│   ├── authController.js
│   ├── blogController.js
│   ├── commentController.js
│   ├── profileController.js
│   └── userController.js
│
├── logs/
│   ├── combined.log
│   └── error.log
│
├── middlewares/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── loggerMiddleware.js
│   ├── rateLimiter.js
│   ├── uploadMiddleware.js
│   ├── validateMiddleware.js
│   └── validateObjectId.js
│
├── models/
│   ├── Admin.js
│   ├── Blog.js
│   ├── Comment.js
│   ├── Profile.js
│   └── User.js
│
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── blogRoutes.js
│   ├── commentRoutes.js
│   ├── profileRoutes.js
│   └── userRoutes.js
│
├── uploads/
│   ├── avatars/
│   └── blogs/
│
├── utils/
│   ├── cacheKey.js
│   ├── generateOtp.js
│   ├── generateToken.js
│   ├── logger.js
│   ├── sendEmail.js
│   └── syncViews.js
│
├── validators/
│   ├── authValidators.js
│   ├── blogValidators.js
│   └── commentValidators.js
│
├── .env
├── .gitignore
├── checklist.md
├── Testing.md
├── package.json
├── package-lock.json
├── README.md
└── server.js

🔄 Authentication Flow (OTP)

User registers

Account created with isVerified = false

OTP generated, hashed, stored with expiry

OTP sent via email

User verifies OTP

Account marked verified

Welcome email sent

User can login

⚡ Redis Usage
🔹 Caching

Blog list: blogs:*

Single blog: blog:<blogId>

View counters synced to DB

🔹 Rate Limiting

Protected routes:

/auth/register

/auth/login

/auth/verify-email

/auth/resend-otp

/auth/forgot-password

/admin/login

Redis atomic counters + TTL used.

🔐 Environment Variables
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

REDIS_URL=your_redis_url

BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender_email

▶️ Run Locally
npm install
npm run dev


Server:

http://localhost:5000

🧠 Design Decisions

User & Admin models separated

OTP & email verification before login

Frontend notifications via toast (no backend notification table)

Redis fail-open strategy

Modular controllers & middlewares

🚧 Future Enhancements (Optional)

OAuth (Google / GitHub)

Admin dashboard UI

Real-time notifications

Automated tests