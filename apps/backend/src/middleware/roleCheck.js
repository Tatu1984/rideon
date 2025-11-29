/**
 * Role-based access control middleware
 * Checks if user has required role(s) to access the route
 */
function roleCheck(allowedRoles) {
  return (req, res, next) => {
    // Ensure user is authenticated (auth middleware should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource'
        }
      });
    }

    next();
  };
}

module.exports = roleCheck;
