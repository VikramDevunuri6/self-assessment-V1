const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Missing or invalid authorization header", ERROR_CODES.UNAUTHORIZED));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch (err) {
    next(new AppError(401, "Invalid or expired token", ERROR_CODES.UNAUTHORIZED));
  }
}

module.exports = authMiddleware;
