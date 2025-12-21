// // routes/commentRoutes.js

const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  replyToComment,
} = require("../controllers/commentController");

const { protectUser } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  createCommentValidator,
  updateCommentValidator,
} = require("../validators/commentValidators");
const validateObjectId = require("../middlewares/validateObjectId");

// GET all comments for a blog (public)
router.get("/:blogId", validateObjectId("blogId"), getComments);

// CREATE comment (private)
router.post(
  "/:blogId",
  protectUser,
  validateObjectId("blogId"),
  createCommentValidator,
  validate,
  addComment
);

// UPDATE comment (private, only author)
router.put(
  "/:id",
  protectUser,
  validateObjectId("id"),
  updateCommentValidator,
  validate,
  updateComment
);

// DELETE comment (private, author or admin)
router.delete("/:id", protectUser, validateObjectId("id"), deleteComment);

// LIKE/UNLIKE comment (private)
router.put("/:id/like", protectUser, validateObjectId("id"), likeComment);

// DISLIKE/UNDISLIKE comment (private)  <-- new route
router.put("/:id/dislike", protectUser, validateObjectId("id"), dislikeComment);


// Reply to a comment
router.post("/:id/reply", protectUser, replyToComment);

module.exports = router;
