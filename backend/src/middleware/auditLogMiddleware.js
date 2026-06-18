const auditLogRepository = require("../repositories/auditLogRepository");
const logger = require("../config/logger");

const SENSITIVE_KEYS = ["password", "newPassword", "temporaryPassword"];

function sanitizeMetadata(body) {
  if (!body || typeof body !== "object") return body;

  const clone = { ...body };
  for (const key of SENSITIVE_KEYS) {
    delete clone[key];
  }
  return clone;
}

/**
 * Records an admin_activity_logs row after a mutation succeeds.
 * The entity id is taken from req.params.id, falling back to
 * res.locals.entityId (set by the controller for newly created resources).
 */
function auditLog(action, entityType) {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      const entityId = req.params.id ?? res.locals.entityId ?? null;

      auditLogRepository
        .record({ adminId: req.user?.userId, action, entityType, entityId, metadata: sanitizeMetadata(req.body) })
        .catch((err) => logger.error({ err }, "failed to write admin activity log"));
    });

    next();
  };
}

module.exports = { auditLog };
