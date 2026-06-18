const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Scored answers for the v1 engine, joined by question.group_no (the PDF
 * question number) rather than the old trait_id column.
 *
 * A session is resumable indefinitely (findInProgressSession), so it can
 * span a question-set cutover and end up with answers pointing at
 * questions that are no longer active -- those are silently dropped here,
 * never scored. They must not be force-included: group_no is reused
 * across question sets (the old set's group_no 1-5 was a section number,
 * unrelated to the new set's group_no 1-48 PDF numbering), so an old
 * answer's group_no can coincidentally collide with a real v1 mapping and
 * silently corrupt a trait score if it weren't filtered out by is_active.
 * submitAssessment's completeness gate (getActiveAnswersForSession) is the
 * actual guard against incomplete submissions -- this function just never
 * lets a stale answer through, even if called directly.
 */
async function getScoredAnswersForSession(sessionId) {
  const { data, error } = await supabase
    .from("answers")
    .select("question_id, option_id, questions ( group_no, is_active ), question_options ( score, option_order )")
    .eq("session_id", sessionId);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data
    .filter((row) => row.questions?.is_active)
    .map((row) => ({
      questionId: row.question_id,
      groupNo: row.questions.group_no,
      optionId: row.option_id,
      optionOrder: row.question_options?.option_order ?? null,
      score: Number(row.question_options?.score ?? 0),
    }));
}

module.exports = { getScoredAnswersForSession };
