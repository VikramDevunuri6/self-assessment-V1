const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getAnswersForSession(sessionId) {
  const { data, error } = await supabase
    .from("answers")
    .select("question_id, option_id")
    .eq("session_id", sessionId);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getScoredAnswersForSession(sessionId) {
  const { data, error } = await supabase
    .from("answers")
    .select("question_id, option_id, questions ( trait_id ), question_options ( score )")
    .eq("session_id", sessionId);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({
    questionId: row.question_id,
    traitId: row.questions?.trait_id ?? null,
    score: Number(row.question_options?.score ?? 0),
  }));
}

async function upsertAnswer({ sessionId, userId, questionId, optionId }) {
  const { data, error } = await supabase
    .from("answers")
    .upsert(
      {
        session_id: sessionId,
        user_id: userId,
        question_id: questionId,
        option_id: optionId,
        answered_at: new Date().toISOString(),
      },
      { onConflict: "session_id,question_id" }
    )
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { getAnswersForSession, getScoredAnswersForSession, upsertAnswer };
