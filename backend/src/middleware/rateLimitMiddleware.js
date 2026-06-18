const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

function rateLimitHandler(req, res, next) {
  next(new AppError(429, "Too many requests, please try again later", ERROR_CODES.RATE_LIMITED));
}

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { generalLimiter, authLimiter };
