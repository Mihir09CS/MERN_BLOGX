📝 Blog App – Backend API

A production-ready, serverless-compatible backend for a modern blog application built with Node.js, Express, MongoDB, Upstash Redis, and ImageKit, featuring secure authentication, email verification, caching, and rate limiting.

This backend is designed to run reliably on Vercel serverless functions and follows real-world production patterns.

🚀 Features Overview
🔐 Authentication & Security

User registration & login (JWT)

Email OTP verification (hashed + expiry-based)

Welcome email after verification

Forgot & reset password

Redis (Upstash) based auth rate limiting

Separate Admin authentication & permissions

Role-safe middleware (user vs admin)

🧑‍💻 User & Profile

User profile management

Avatar upload (ImageKit)

Follow / unfollow users

Followers & following

User bookmarks

📝 Blog Management

Create, read, update, delete blogs

Categories & tags

Blog cover image upload (ImageKit CDN)

Like / dislike blogs

Bookmark blogs

Popular blogs

Pagination, filtering & search

💬 Comments System

Add comments to blogs

Reply to comments (nested structure)

Like / dislike comments

Update & delete comments

Ownership-based authorization

⚡ Performance & Scalability

Upstash Redis caching (blog lists)

Version-based cache invalidation

Redis-based rate limiting

Optimized MongoDB queries (lean, indexes)

Serverless-safe DB connection caching

📧 Email System

Transactional emails via Brevo (Sendinblue)

OTP verification emails

Welcome emails

Password reset emails

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

Cache & Rate Limiting: Upstash Redis (REST)

Authentication: JWT, bcrypt

Email: Brevo SMTP API

File Uploads: ImageKit + Multer (memory storage)

Logging: Winston

Validation: express-validator

Deployment: Vercel (Serverless)

📁 Folder Structure
backend/
│
├── config/
│   └── db.js                 # Serverless-safe MongoDB connection
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
│   ├── rateLimiter.js        # Upstash Redis limiter
│   ├── uploadMiddleware.js   # Multer memory storage
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
├── utils/
│   ├── cacheKey.js           # Cache key generator
│   ├── generateOtp.js
│   ├── generateToken.js
│   ├── imagekit.js           # ImageKit config
│   ├── logger.js
│   └── sendEmail.js
│
├── validators/
│   ├── authValidators.js
│   ├── blogValidators.js
│   └── commentValidators.js
│
├── vercel.json
├── .env.example
├── package.json
├── README.md
└── server.js                 # Express app (exported, no listen)




🔄 Authentication Flow (OTP)

User registers

Account created with isAccountVerified = false

OTP generated, hashed, stored with expiry

OTP sent via email

User verifies OTP

Account marked verified

Welcome email sent

User can log in

⚡ Redis (Upstash) Usage
🔹 Caching

Blog list cache: blogs:*

Version-based cache invalidation

No manual JSON.stringify / JSON.parse

Serverless-safe REST calls

🔹 Rate Limiting

Protected routes:

/auth/register

/auth/login

/auth/verify-email

/auth/resend-otp

/auth/forgot-password

/admin/login

Uses Redis atomic counters with TTL.

🔐 Environment Variables
# Core
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender_email

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

▶️ Run Locally
npm install
npm run dev


Local server:

http://localhost:5000


In production, the app is exported and executed by Vercel (no app.listen()).

🧠 Key Design Decisions

Serverless-first architecture (Vercel)

Express app exported instead of listening

MongoDB connection caching for cold starts

Upstash Redis instead of TCP Redis

ImageKit instead of filesystem uploads

Separate User & Admin models

OTP-based email verification

Redis fail-open strategy

Frontend notifications handled via toast (no DB notifications table)

🚧 Future Enhancements

OAuth (Google / GitHub)

Admin dashboard UI

Real-time notifications (WebSockets / SSE)

Automated test coverage

Search indexing (Elastic / Atlas Search)