// // validators/commentValidators.js
// const { body } = require("express-validator");

// const createCommentValidator = [
//   body("content")
//     .trim()
//     .notEmpty()
//     .withMessage("Comment content is required")
//     .isLength({ min: 2 })
//     .withMessage("Comment must be at least 2 characters"),
// ];

// const updateCommentValidator = [
//   body("content")
//     .optional()
//     .trim()
//     .isLength({ min: 2 })
//     .withMessage("Comment must be at least 2 characters"),
// ];

// module.exports = { createCommentValidator, updateCommentValidator };

// ____________________________________________________________________

const { body } = require("express-validator");

const createCommentValidator = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1 })
    .withMessage("Comment cannot be empty"),
];

const updateCommentValidator = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1 })
    .withMessage("Comment cannot be empty"),
];

module.exports = { createCommentValidator, updateCommentValidator };
