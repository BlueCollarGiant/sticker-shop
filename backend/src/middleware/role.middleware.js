function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires ${role} role`,
      });
      return;
    }

    next();
  };
}

function requireUser(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }
  next();
}

function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

module.exports = {
  requireRole,
  requireUser,
  requireAdmin,
};
