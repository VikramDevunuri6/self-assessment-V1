const assessmentRepository = require("../../repositories/assessmentRepository");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

async function listSessions(query) {
  const pagination = parsePagination(query);
  const { data, count } = await assessmentRepository.listSessions({
    ...pagination,
    status: query.status,
    userId: query.userId,
  });

  const sessions = data.map((session) => ({
    id: session.id,
    userId: session.user_id,
    status: session.status,
    startedAt: session.started_at,
    completedAt: session.completed_at,
    student: session.profiles ? { fullName: session.profiles.full_name, email: session.profiles.email } : null,
  }));

  return { sessions, pagination: buildPaginationMeta(pagination, count) };
}

module.exports = { listSessions };
