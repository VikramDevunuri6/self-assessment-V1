const auditLogService = require("../../services/admin/auditLogService");
const asyncHandler = require("../../utils/asyncHandler");

const listAuditLogs = asyncHandler(async (req, res) => {
  res.json(await auditLogService.listAuditLogs(req.query));
});

module.exports = { listAuditLogs };
