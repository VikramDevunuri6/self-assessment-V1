const auditLogRepository = require("../../repositories/auditLogRepository");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

function mapLog(log) {
  return {
    id: log.id,
    adminId: log.admin_id,
    admin: log.profiles ? { fullName: log.profiles.full_name, email: log.profiles.email } : null,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    metadata: log.metadata,
    createdAt: log.created_at,
  };
}

async function listAuditLogs(query) {
  const pagination = parsePagination(query);
  const { data, count } = await auditLogRepository.listLogs(pagination);

  return { logs: data.map(mapLog), pagination: buildPaginationMeta(pagination, count) };
}

module.exports = { listAuditLogs };
