const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { SESSION_STATUS } = require("../constants/sessionStatus");

const assessmentRepository = require("../repositories/assessmentRepository");
const questionRepository = require("../repositories/questionRepository");
const answerRepository = require("../repositories/answerRepository");
const { assertOwnership } = require("./assessmentService");

async function saveAnswer({ sessionId, userId, questionId, optionId }) {
  const session = await assessmentRepository.getSessionById(sessionId);
  assertOwnership(session, userId);

  if (session.status !== SESSION_STATUS.IN_PROGRESS) {
    throw new AppError(409, "This assessment session is already completed", ERROR_CODES.CONFLICT);
  }

  const option = await questionRepository.getOptionForQuestion(questionId, optionId);
  if (!option) {
    throw new AppError(
      400,
      "The selected option does not belong to this question",
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  await answerRepository.upsertAnswer({ sessionId, userId, questionId, optionId });

  const [answers, totalQuestions] = await Promise.all([
    answerRepository.getAnswersForSession(sessionId),
    questionRepository.getActiveQuestionCount(),
  ]);

  return { progress: { answered: answers.length, total: totalQuestions } };
}

module.exports = { saveAnswer };
