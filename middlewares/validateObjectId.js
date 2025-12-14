const mongoose = require("mongoose");

const validateObjectId = (param) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
    res.status(400);
    return next(new Error(`Invalid ObjectId for ${param}`));
  }
  next();
};

module.exports = validateObjectId;
