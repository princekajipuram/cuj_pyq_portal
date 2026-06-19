export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Strict override: Even if DB says admin, enforce email
    let userRole = req.user.role;
    if (userRole === 'admin' && req.user.email?.toLowerCase() !== 'admin@cuj.edu') {
      userRole = 'user'; // Demote in-memory
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this resource`
      });
    }

    next();
  };
};
export default authorize;
