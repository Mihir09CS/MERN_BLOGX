 
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
