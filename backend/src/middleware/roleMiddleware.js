const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action", ERROR_CODES.FORBIDDEN)
      );
    }
    next();
  };
}

module.exports = requireRole;
