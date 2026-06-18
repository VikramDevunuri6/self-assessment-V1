const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { SESSION_STATUS } = require("../constants/sessionStatus");

const assessmentRepository = require("../repositories/assessmentRepository");
const questionRepository = require("../repositories/questionRepository");
const answerRepository = require("../repositories/answerRepository");
const resultRepository = require("../repositories/resultRepository");
const v1ResultRepository = require("../v1Repositories/v1ResultRepository");
const { buildReportV1 } = require("../v1Engine");

function assertOwnership(session, userId) {
  if (session.user_id !== userId) {
    throw new AppError(403, "You do not have access to this assessment session", ERROR_CODES.FORBIDDEN);
  }
}

async function getLatestSession(userId) {
  const session = await assessmentRepository.getLatestSessionForUser(userId);
  if (!session) {
    return { hasSession: false };
  }

  let hasResult = false;
  let engineVersion = null;
  if (session.status === SESSION_STATUS.COMPLETED) {
    const v1Result = await v1ResultRepository.getLatestResult(session.id);
    if (v1Result) {
      hasResult = true;
      engineVersion = "v1";
    } else {
      // Legacy fallback: sessions completed under the old (now dormant)
      // question set still have their report in the old table.
      const legacyResult = await resultRepository.getLatestResult(session.id);
      hasResult = !!legacyResult;
      engineVersion = legacyResult ? "legacy" : null;
    }
  }

  return { hasSession: true, sessionId: session.id, status: session.status, hasResult, engineVersion };
}

async function startAssessment(userId) {
  const assessment = await assessmentRepository.getActiveAssessment();

  let session = await assessmentRepository.findInProgressSession(userId, assessment.id);
  if (!session) {
    session = await assessmentRepository.createSession(userId, assessment.id);
  }

  const totalQuestions = await questionRepository.getActiveQuestionCount();

  return { sessionId: session.id, status: session.status, totalQuestions };
}

async function getQuestionsForSession(sessionId, userId) {
  const session = await assessmentRepository.getSessionById(sessionId);
  assertOwnership(session, userId);

  const [questions, answers, totalQuestions] = await Promise.all([
    questionRepository.getActiveQuestions(),
    answerRepository.getActiveAnswersForSession(sessionId),
    questionRepository.getActiveQuestionCount(),
  ]);

  const answerMap = {};
  for (const answer of answers) {
    answerMap[answer.question_id] = answer.option_id;
  }

  return {
    sessionId: session.id,
    status: session.status,
    questions,
    answers: answerMap,
    progress: { answered: answers.length, total: totalQuestions },
  };
}

async function submitAssessment(sessionId, userId) {
  const session = await assessmentRepository.getSessionById(sessionId);
  assertOwnership(session, userId);

  if (session.status === SESSION_STATUS.COMPLETED) {
    throw new AppError(409, "This assessment has already been submitted", ERROR_CODES.CONFLICT);
  }

  const [answers, totalQuestions] = await Promise.all([
    answerRepository.getActiveAnswersForSession(sessionId),
    questionRepository.getActiveQuestionCount(),
  ]);

  if (answers.length < totalQuestions) {
    throw new AppError(
      400,
      `Please answer all questions before submitting (${answers.length}/${totalQuestions} answered)`,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const { reportJson, persistable } = await buildReportV1(sessionId, session.started_at);

  const latest = await v1ResultRepository.getLatestResult(sessionId);
  const version = (latest?.version || 0) + 1;

  await v1ResultRepository.insertSessionTraitScores(sessionId, persistable.traitScoreRows);
  await v1ResultRepository.insertSessionDepartmentScores(sessionId, persistable.departmentScoreRows);
  await v1ResultRepository.insertResult({
    sessionId,
    userId,
    reportJson,
    version,
    ...persistable.summary,
  });

  const updatedSession = await assessmentRepository.updateSession(sessionId, {
    status: SESSION_STATUS.COMPLETED,
    completed_at: new Date().toISOString(),
  });

  return { sessionId, status: updatedSession.status, version, report: reportJson };
}

module.exports = {
  getLatestSession,
  startAssessment,
  getQuestionsForSession,
  submitAssessment,
  assertOwnership,
};
