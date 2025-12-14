// // validators/authValidators.js
// const { body } = require("express-validator");

// const registerValidator = [
//   body("name")
//     .trim()
//     .notEmpty()
//     .withMessage("Name is required")
//     .isLength({ min: 2 })
//     .withMessage("Name must be at least 2 characters"),
//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Provide a valid email"),
//   body("password")
//     .notEmpty()
//     .withMessage("Password is required")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters"),
// ];

// const loginValidator = [
//   body("email")
//     .trim()
//     .notEmpty()
//     .withMessage("Email is required")
//     .isEmail()
//     .withMessage("Provide a valid email"),
//   body("password").notEmpty().withMessage("Password is required"),
// ];

// module.exports = { registerValidator, loginValidator };




// validators/authValidators.js
const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character (@, $, !, %, *, ?, &)"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (!value) {
        throw new Error("Confirm Password is required");
      }
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidator, loginValidator };
