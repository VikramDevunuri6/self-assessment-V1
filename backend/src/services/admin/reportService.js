const AppError = require("../../utils/AppError");
const { ERROR_CODES } = require("../../constants/errorCodes");

const resultRepository = require("../../repositories/resultRepository");
const assessmentRepository = require("../../repositories/assessmentRepository");
const reportHistoryRepository = require("../../repositories/reportHistoryRepository");
const answerRepository = require("../../repositories/answerRepository");
const questionRepository = require("../../repositories/questionRepository");
const { buildReport } = require("../../resultEngine/buildReport");
const { buildBreakdown } = require("../../resultEngine/buildBreakdown");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

async function listReports(query) {
  const pagination = parsePagination(query);
  const { data, count } = await resultRepository.listResults(pagination);

  const reports = data.map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    version: row.version,
    generatedAt: row.generated_at,
    personalityType: row.report_json?.personalityType ?? null,
    confidence: row.report_json?.confidence ?? null,
    student: row.profiles ? { fullName: row.profiles.full_name, email: row.profiles.email } : null,
  }));

  return { reports, pagination: buildPaginationMeta(pagination, count) };
}

async function getReportDetail(sessionId) {
  const session = await assessmentRepository.getSessionById(sessionId);
  const result = await resultRepository.getLatestResult(sessionId);

  if (!result) {
    throw new AppError(404, "No report has been generated for this session yet", ERROR_CODES.NOT_FOUND);
  }

  return {
    sessionId,
    userId: session.user_id,
    status: session.status,
    student: session.profiles ? { fullName: session.profiles.full_name, email: session.profiles.email } : null,
    version: result.version,
    generatedAt: result.generated_at,
    report: result.report_json,
  };
}

/**
 * Re-runs the result engine against the session's stored answers and
 * persists a new report version, recording the regeneration in report_history.
 */
async function regenerateReport(sessionId, adminId) {
  const session = await assessmentRepository.getSessionById(sessionId);

  const previous = await resultRepository.getLatestResult(sessionId);
  if (!previous) {
    throw new AppError(404, "No existing report to regenerate for this session", ERROR_CODES.NOT_FOUND);
  }

  const report = await buildReport(sessionId);
  const version = previous.version + 1;

  const result = await resultRepository.insertResult({
    sessionId,
    userId: session.user_id,
    reportJson: report,
    version,
  });

  await reportHistoryRepository.recordRegeneration({
    resultId: result.id,
    sessionId,
    userId: session.user_id,
    reportJson: report,
    generatedBy: adminId,
  });

  return { sessionId, status: session.status, version, report };
}

/**
 * Per-question answer review for a session: every question alongside its
 * options (with scores), the student's selected option, category and trait.
 * Powers the admin "Answer Sheet" and "Question-by-Question Review" views.
 */
async function getAnswerSheet(sessionId) {
  const session = await assessmentRepository.getSessionById(sessionId);

  const [answers, questions] = await Promise.all([
    answerRepository.getAnswersForSession(sessionId),
    questionRepository.getQuestionsForReview(),
  ]);

  const selectedOptionByQuestionId = new Map(answers.map((answer) => [answer.question_id, answer.option_id]));

  const items = questions.map((question) => {
    const selectedOptionId = selectedOptionByQuestionId.get(question.id) ?? null;
    const selectedOption = question.question_options.find((option) => option.id === selectedOptionId) ?? null;

    return {
      questionId: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      groupNo: question.group_no,
      category: question.categories ? { code: question.categories.code, name: question.categories.name } : null,
      trait: question.traits ? { code: question.traits.code, name: question.traits.name } : null,
      options: question.question_options.map((option) => ({
        id: option.id,
        text: option.option_text,
        order: option.option_order,
        score: Number(option.score),
      })),
      selectedOptionId,
      selectedOption: selectedOption
        ? { id: selectedOption.id, text: selectedOption.option_text, score: Number(selectedOption.score) }
        : null,
    };
  });

  return {
    sessionId,
    userId: session.user_id,
    status: session.status,
    student: session.profiles ? { fullName: session.profiles.full_name, email: session.profiles.email } : null,
    totalQuestions: items.length,
    answeredCount: items.filter((item) => item.selectedOptionId !== null).length,
    items,
  };
}

/**
 * Live scoring breakdown for a session: trait score calculations, dimension
 * score calculations, confidence, and personality-type matching evaluation
 * order. Powers the admin "Score Breakdown" and "Profile Generation Details" views.
 */
async function getScoreBreakdown(sessionId) {
  const session = await assessmentRepository.getSessionById(sessionId);
  const breakdown = await buildBreakdown(sessionId);

  return {
    sessionId,
    userId: session.user_id,
    status: session.status,
    student: session.profiles ? { fullName: session.profiles.full_name, email: session.profiles.email } : null,
    ...breakdown,
  };
}

module.exports = { listReports, getReportDetail, regenerateReport, getAnswerSheet, getScoreBreakdown };
