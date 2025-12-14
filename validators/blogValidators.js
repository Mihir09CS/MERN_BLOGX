// // validators/blogValidators.js
// const { body } = require("express-validator");

// const createBlogValidator = [
//   body("title")
//     .trim()
//     .notEmpty()
//     .withMessage("Title is required")
//     .isLength({ min: 3 })
//     .withMessage("Title must be at least 3 characters"),
//   body("content")
//     .trim()
//     .notEmpty()
//     .withMessage("Content is required")
//     .isLength({ min: 10 })
//     .withMessage("Content must be at least 10 characters"),
// ];

// const updateBlogValidator = [
//   body("title")
//     .optional()
//     .trim()
//     .isLength({ min: 3 })
//     .withMessage("Title must be at least 3 characters"),
//   body("content")
//     .optional()
//     .trim()
//     .isLength({ min: 10 })
//     .withMessage("Content must be at least 10 characters"),
// ];

// module.exports = { createBlogValidator, updateBlogValidator };


// ________________________________________________________
const { body } = require("express-validator");

const createBlogValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 20 })
    .withMessage("Content must be at least 20 characters"),
  body("category").optional().trim(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

const updateBlogValidator = [
  body("title").optional().isLength({ min: 3 }).withMessage("Title too short"),
  body("content")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Content too short"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

module.exports = { createBlogValidator, updateBlogValidator };
