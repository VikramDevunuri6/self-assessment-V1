const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { SESSION_STATUS } = require("../constants/sessionStatus");

const assessmentRepository = require("../repositories/assessmentRepository");
const questionRepository = require("../repositories/questionRepository");
const answerRepository = require("../repositories/answerRepository");
const resultRepository = require("../repositories/resultRepository");
const { buildReport } = require("../resultEngine/buildReport");

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
  if (session.status === SESSION_STATUS.COMPLETED) {
    const result = await resultRepository.getLatestResult(session.id);
    hasResult = !!result;
  }

  return { hasSession: true, sessionId: session.id, status: session.status, hasResult };
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
    answerRepository.getAnswersForSession(sessionId),
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
    answerRepository.getAnswersForSession(sessionId),
    questionRepository.getActiveQuestionCount(),
  ]);

  if (answers.length < totalQuestions) {
    throw new AppError(
      400,
      `Please answer all questions before submitting (${answers.length}/${totalQuestions} answered)`,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const report = await buildReport(sessionId);

  const latest = await resultRepository.getLatestResult(sessionId);
  const version = (latest?.version || 0) + 1;

  await resultRepository.insertResult({ sessionId, userId, reportJson: report, version });

  const updatedSession = await assessmentRepository.updateSession(sessionId, {
    status: SESSION_STATUS.COMPLETED,
    completed_at: new Date().toISOString(),
  });

  return { sessionId, status: updatedSession.status, version, report };
}

module.exports = {
  getLatestSession,
  startAssessment,
  getQuestionsForSession,
  submitAssessment,
  assertOwnership,
};
