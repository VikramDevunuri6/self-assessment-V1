const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { ROLE_PERMISSIONS } = require("../constants/permissions");

function requirePermission(...permissions) {
  return (req, res, next) => {
    const granted = (req.user && ROLE_PERMISSIONS[req.user.role]) || [];
    const allowed = permissions.some((permission) => granted.includes(permission));

    if (!allowed) {
      return next(
        new AppError(403, "You do not have permission to perform this action", ERROR_CODES.FORBIDDEN)
      );
    }

    next();
  };
}

module.exports = requirePermission;
