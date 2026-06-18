const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Pre-scoring integrity check, run before any trait/department/confidence
 * math. Confirms every question the v1 framework expects an answer for
 * (the 45 scoring questions + 3 validity questions, identified by
 * group_no) has exactly one active-question answer, and that every
 * answered active question has a scoring or validity mapping configured.
 * Throws a clear, specific AppError instead of letting the scoring engine
 * run on incomplete or unmapped data -- callers (the controller's
 * asyncHandler -> errorMiddleware) turn this into a proper JSON error
 * response, never an unhandled crash.
 */
function validateAnswersForScoring({ scoredAnswers, traitQuestionMap, validityGroupNos }) {
  const expectedGroupNos = new Set([...traitQuestionMap.map((m) => m.groupNo), ...validityGroupNos]);
  const answeredGroupNos = new Set(scoredAnswers.map((a) => a.groupNo));

  const missing = [...expectedGroupNos].filter((g) => !answeredGroupNos.has(g)).sort((a, b) => a - b);
  if (missing.length) {
    throw new AppError(
      400,
      `Cannot generate report: ${missing.length} active question(s) are missing an answer (question #${missing.join(", ")}). Please answer all questions before submitting.`,
      ERROR_CODES.VALIDATION_ERROR,
      { missingQuestionNumbers: missing }
    );
  }

  const unmapped = [...new Set(scoredAnswers.map((a) => a.groupNo).filter((g) => !expectedGroupNos.has(g)))];
  if (unmapped.length) {
    throw new AppError(
      500,
      `Cannot generate report: question #${unmapped.join(", ")} is active but has no v1 scoring mapping configured (missing from v1_trait_questions / v1_validity_questions).`,
      ERROR_CODES.INTERNAL_ERROR,
      { unmappedQuestionNumbers: unmapped }
    );
  }
}

module.exports = { validateAnswersForScoring };
