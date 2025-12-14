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

const { protect } = require("../middlewares/authMiddleware");
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
  protect,
  validateObjectId("blogId"),
  createCommentValidator,
  validate,
  addComment
);

// UPDATE comment (private, only author)
router.put(
  "/:id",
  protect,
  validateObjectId("id"),
  updateCommentValidator,
  validate,
  updateComment
);

// DELETE comment (private, author or admin)
router.delete("/:id", protect, validateObjectId("id"), deleteComment);

// LIKE/UNLIKE comment (private)
router.put("/:id/like", protect, validateObjectId("id"), likeComment);

// DISLIKE/UNDISLIKE comment (private)  <-- new route
router.put("/:id/dislike", protect, validateObjectId("id"), dislikeComment);


// Reply to a comment
router.post("/:id/reply", protect, replyToComment);

module.exports = router;
