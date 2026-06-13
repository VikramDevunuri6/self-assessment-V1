const logger = require("../config/logger");

function loggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}

module.exports = loggerMiddleware;
