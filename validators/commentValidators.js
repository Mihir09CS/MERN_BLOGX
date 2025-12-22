// validators/commentValidators.js


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
