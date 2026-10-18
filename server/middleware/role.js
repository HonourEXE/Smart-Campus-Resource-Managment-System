/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permissions at the server layer regardless of frontend actions.
 * @param  {...string} allowedRoles - Array of permitted roles (e.g., 'admin', 'resource_manager', 'faculty', 'student')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { authorize };
