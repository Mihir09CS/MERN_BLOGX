// const asyncHandler = require("express-async-handler");

// const authorize = (roles = []) => {
//   if (typeof roles === "string") roles = [roles];
//   return asyncHandler((req, res, next) => {
//     if (!req.user) {
//       res.status(401);
//       throw new Error("Not authorized");
//     }
//     if (roles.length && !roles.includes(req.user.role)) {
//       res.status(403);
//       throw new Error("Forbidden: insufficient role");
//     }
//     next();
//   });
// };

// module.exports = { authorize };
 
// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Not authorized for this action");
    }
    next();
  };
};

module.exports = { authorize };
