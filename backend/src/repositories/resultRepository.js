const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getLatestResult(sessionId) {
  const { data, error } = await supabase
    .from("assessment_results")
    .select("*")
    .eq("session_id", sessionId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function insertResult({ sessionId, userId, reportJson, version }) {
  const { data, error } = await supabase
    .from("assessment_results")
    .insert({ session_id: sessionId, user_id: userId, report_json: reportJson, version })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

/**
 * Paginated assessment_results (all versions), newest first.
 */
async function listResults({ from, to }) {
  const { data, error, count } = await supabase
    .from("assessment_results")
    .select(
      "id, session_id, user_id, version, generated_at, report_json, profiles ( full_name, email )",
      { count: "exact" }
    )
    .order("generated_at", { ascending: false })
    .range(from, to);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return { data, count };
}

module.exports = { getLatestResult, insertResult, listResults };
