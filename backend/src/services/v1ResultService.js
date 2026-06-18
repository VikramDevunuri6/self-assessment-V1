const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { ROLES } = require("../constants/roles");

const assessmentRepository = require("../repositories/assessmentRepository");
const v1ResultRepository = require("../v1Repositories/v1ResultRepository");

async function loadLatestResult(sessionId, user) {
  const session = await assessmentRepository.getSessionById(sessionId);

  if (user.role !== ROLES.ADMIN && session.user_id !== user.userId) {
    throw new AppError(403, "You do not have access to this assessment session", ERROR_CODES.FORBIDDEN);
  }

  const result = await v1ResultRepository.getLatestResult(sessionId);
  if (!result) {
    throw new AppError(404, "No v1 report has been generated for this session yet", ERROR_CODES.NOT_FOUND);
  }

  return { session, result };
}

function buildMeta(session, result) {
  return {
    studentName: session.profiles?.full_name,
    rollNumber: session.profiles?.roll_number,
    branch: session.profiles?.branch,
    passingYear: session.profiles?.passing_year,
    startedAt: session.started_at,
    completedAt: session.completed_at,
    reportId: result.id,
  };
}

async function getResultBySessionId(sessionId, user) {
  const { session, result } = await loadLatestResult(sessionId, user);

  return {
    sessionId,
    status: session.status,
    version: result.version,
    generatedAt: result.generated_at,
    report: result.report_json,
    engineVersion: "v1",
    meta: buildMeta(session, result),
  };
}

async function getReportForPdf(sessionId, user) {
  const { session, result } = await loadLatestResult(sessionId, user);

  return { report: result.report_json, generatedAt: result.generated_at, meta: buildMeta(session, result) };
}

module.exports = { getResultBySessionId, getReportForPdf };
