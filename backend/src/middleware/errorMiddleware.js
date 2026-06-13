const AppError = require("../utils/AppError");
const logger = require("../config/logger");
const { ERROR_CODES } = require("../constants/errorCodes");

function notFoundHandler(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, ERROR_CODES.NOT_FOUND));
}

function errorMiddleware(err, req, res, next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : ERROR_CODES.INTERNAL_ERROR;
  const message = isAppError ? err.message : "Internal server error";

  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, message);
  } else {
    logger.warn({ path: req.originalUrl, method: req.method, code }, message);
  }

  const body = { error: { message, code } };
  if (isAppError && err.details) {
    body.error.details = err.details;
  }

  res.status(statusCode).json(body);
}

module.exports = { errorMiddleware, notFoundHandler };
