// Example middleware skeleton
const authMiddleware = (req, res, next) => {
  // Here you can check JWT token or session
  next();
};

module.exports = authMiddleware;
