/**
 * Admin Middleware
 * Ensures the authenticated user has admin role
 */
const admin = (req, res, next) => {
  // Check if user is authenticated (should be set by auth middleware)
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};

module.exports = admin;


