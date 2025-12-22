
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  console.log("REQ BODY >>>", req.body);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
