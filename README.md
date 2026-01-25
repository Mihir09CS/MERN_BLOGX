# DevScribe 📝

**A Full-Stack Blog Platform (Serverless MERN)**

DevScribe is a modern, scalable, full-stack blogging platform engineered using real-world SaaS principles. It is built with a **serverless-first backend**, a **decoupled frontend**, and a strong focus on **security, scalability, and clean system design**.

This is not a tutorial clone or a basic CRUD app. DevScribe is designed to simulate how a real production blogging platform is architected, deployed, and maintained.

---

## TL;DR

DevScribe is a serverless MERN blog platform with secure authentication, role-based access control, Redis caching, CDN-based media delivery, and admin moderation — built with production constraints and scalability in mind.

---

## 🌐 Live Deployment

### Frontend

* **Platform:** Netlify
* **URL:** [https://devscribe-a.netlify.app](https://devscribe-a.netlify.app)
* **Tech:** React + Vite

### Backend API

* **Platform:** Vercel (Serverless Functions)
* **Base URL:** [https://mern-blogx.vercel.app/api](https://mern-blogx.vercel.app/api)
* **Tech:** Node.js + Express

---

## 🎯 Problem This Project Solves

Most student-built blog platforms fail to address real-world engineering challenges such as authentication security, scalability, moderation, and serverless constraints. DevScribe is built to bridge this gap by applying production-grade backend and full-stack practices commonly used in SaaS products.

---

## 🧠 Core Design Philosophy

* Serverless-first (stateless, cold-start safe)
* API-first (frontend-agnostic backend)
* Security by default (auth, validation, RBAC)
* Scalability-ready (Redis caching, CDN media)
* Admin moderation instead of approval bottlenecks
* Separation of concerns (clean layering)
* Fail-safe infrastructure choices

---

## 🏗️ Architecture Overview

```
User Browser
     │
     ▼
Netlify (React Frontend)
     │
     ▼
Vercel Serverless API (/api/*)
     │
 ┌──────────────┬──────────────┬──────────────┐
 ▼              ▼              ▼
MongoDB     Upstash Redis    External Services
(Database)  (Cache + RL)     (Brevo, ImageKit, OAuth)
```

---

## 🚀 Features Overview

### 🔐 Authentication & Security

* JWT-based authentication
* Email OTP verification (hashed + expiry-based)
* Welcome email after verification
* Forgot & reset password flow
* Redis-based rate limiting for auth endpoints
* Separate Admin authentication
* Role-safe middleware (User vs Admin)
* Ownership-based authorization
* Google OAuth authentication

---

### 🧑‍💻 User & Profile System

* Profile creation & update
* Avatar upload (ImageKit CDN)
* Social links (GitHub, LinkedIn, Twitter, Instagram, Website)
* Follow / unfollow users
* Followers & following lists
* Public & private profile views
* User bookmarks
* Profile statistics aggregation

---

### 📝 Blog Management

* Create, read, update, delete blogs
* Auto-publish model (no approval bottleneck)
* Categories & tags
* Blog cover image upload (ImageKit CDN)
* Like / dislike blogs
* Bookmark blogs
* Popular blogs
* Pagination & filtering
* Search-ready architecture

---

### 💬 Comments System

* Add comments to blogs
* Nested replies (threaded comments)
* Like / unlike comments
* Edit & delete comments
* Ownership-based deletion
* Blog author moderation
* Comment disable option per blog

---

### 🛡️ Admin Dashboard

* Admin login & authorization
* User management (ban / unban / delete)
* Blog moderation (remove / restore)
* Comment moderation
* Report review system
* Platform statistics
* Logs access

> Admin APIs are fully isolated and protected using dedicated authentication and role-based middleware.

---

## ⚡ Performance & Scalability

### Redis (Upstash)

* REST-based Redis (serverless compatible)
* Blog list caching
* Version-based cache invalidation
* Atomic rate limiting with TTL
* Fail-open strategy (Redis failure does not crash the app)

### MongoDB Optimization

* Indexed queries
* Lean queries
* Connection caching for serverless cold starts
* Efficient population strategy

---

## 📧 Email System

* Brevo (Sendinblue) transactional emails
* OTP verification emails
* Welcome emails
* Password reset emails
* Secure tokenized links

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Upstash Redis (REST)
* JWT, bcrypt
* ImageKit + Multer (memory storage)
* Brevo SMTP API
* Winston logging
* express-validator
* Vercel (Serverless)

### Frontend

* React (Vite)
* React Router
* Axios
* Modular custom hooks
* Protected routes
* Admin dashboard UI
* Toast-based notifications

---

## 📁 Backend Folder Structure

```
backend/
│
├── config/            # DB & serverless config
├── controllers/       # Business logic
├── middlewares/       # Auth, validation, rate limit
├── models/            # Mongoose schemas
├── routes/            # API routes
├── utils/             # Helpers (email, cache, tokens)
├── validators/        # Request validation
├── logs/              # Winston logs
├── server.js          # Express app export
└── vercel.json
```

---

## 🔄 Authentication Flow (OTP)

1. User registers
2. Account created (`isAccountVerified = false`)
3. OTP generated, hashed, stored with expiry
4. OTP emailed to user
5. User verifies OTP
6. Account marked as verified
7. Welcome email sent
8. User can log in

---

## 🔐 Environment Variables

```
# Core
MONGO_URI=
JWT_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email (Brevo)
BREVO_API_KEY=
SENDER_EMAIL=

# ImageKit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

---

## ▶️ Local Development

```bash
npm install
npm run dev
```

Backend:

```
http://localhost:5000
```

Frontend:

```
http://localhost:5173
```

---

## 🧠 Key Engineering Decisions

* Serverless-first architecture using Vercel
* Express app exported (no `app.listen`) for serverless execution
* MongoDB connection caching to handle cold starts
* Redis REST instead of TCP Redis for compatibility
* CDN-based media storage (ImageKit)
* No filesystem usage
* Separate User & Admin models
* OTP-based email verification
* OAuth integration
* Admin moderation instead of content approval
* Decoupled frontend & backend deployments

---

## ⚖️ Trade-offs & Limitations

* Serverless cold starts may affect first-request latency
* No background job queue (emails handled synchronously)
* Redis fail-open strategy favors availability over strict rate enforcement
* Full-text search engine not yet integrated

---

## 🚧 Future Enhancements

* Real-time notifications (WebSockets / SSE)
* Automated testing (Jest / Supertest)
* Search indexing (Elastic / Atlas Search)
* Background jobs & queues
* Recommendation engine
* Advanced analytics
* AI-assisted moderation

---

## 🏁 Final Note

DevScribe demonstrates production-level backend and full-stack engineering practices. It reflects strong system design, scalability awareness, security fundamentals, and real-world architectural thinking — making it suitable for technical interviews and placement evaluations.

