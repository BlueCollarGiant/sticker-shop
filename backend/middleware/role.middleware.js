function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires ${role} role`
      });
    }

    next();
  };
}

function requireUser() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    next();
  };
}

function requireAdmin() {
  return requireRole('admin');
}

module.exports = {
  requireRole,
  requireUser,
  requireAdmin
};
