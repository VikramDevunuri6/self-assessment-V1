const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { ROLES } = require("../constants/roles");

const assessmentRepository = require("../repositories/assessmentRepository");
const resultRepository = require("../repositories/resultRepository");
const reportHistoryRepository = require("../repositories/reportHistoryRepository");

async function loadLatestResult(sessionId, user) {
  const session = await assessmentRepository.getSessionById(sessionId);

  if (user.role !== ROLES.ADMIN && session.user_id !== user.userId) {
    throw new AppError(403, "You do not have access to this assessment session", ERROR_CODES.FORBIDDEN);
  }

  const result = await resultRepository.getLatestResult(sessionId);
  if (!result) {
    throw new AppError(404, "No report has been generated for this session yet", ERROR_CODES.NOT_FOUND);
  }

  return { session, result };
}

async function getResultBySessionId(sessionId, user) {
  const { session, result } = await loadLatestResult(sessionId, user);

  return {
    sessionId,
    status: session.status,
    version: result.version,
    generatedAt: result.generated_at,
    report: result.report_json,
  };
}

async function getReportForPdf(sessionId, user) {
  const { session, result } = await loadLatestResult(sessionId, user);

  await reportHistoryRepository.recordPdfGeneration({
    resultId: result.id,
    sessionId,
    userId: session.user_id,
    reportJson: result.report_json,
    generatedBy: user.userId,
  });

  return { report: result.report_json, generatedAt: result.generated_at };
}

module.exports = { getResultBySessionId, getReportForPdf };
