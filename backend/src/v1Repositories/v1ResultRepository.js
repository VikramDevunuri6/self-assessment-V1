const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function insertSessionTraitScores(sessionId, rows) {
  const payload = rows.map((row) => ({
    session_id: sessionId,
    trait_id: row.traitId,
    raw_score: row.rawScore,
    normalized_score: row.normalizedScore,
    item_count: row.itemCount,
  }));

  const { error } = await supabase
    .from("v1_session_trait_scores")
    .upsert(payload, { onConflict: "session_id,trait_id" });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
}

async function insertSessionDepartmentScores(sessionId, rows) {
  const payload = rows.map((row) => ({
    session_id: sessionId,
    department_id: row.departmentId,
    fit_score: row.fitScore,
  }));

  const { error } = await supabase
    .from("v1_session_department_scores")
    .upsert(payload, { onConflict: "session_id,department_id" });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
}

async function getLatestResult(sessionId) {
  const { data, error } = await supabase
    .from("v1_assessment_results")
    .select("*")
    .eq("session_id", sessionId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function insertResult({
  sessionId,
  userId,
  overallScore,
  band,
  confidenceLevel,
  validityScore,
  straightLiningFlag,
  tooFastFlag,
  reportJson,
  version,
}) {
  const { data, error } = await supabase
    .from("v1_assessment_results")
    .insert({
      session_id: sessionId,
      user_id: userId,
      overall_score: overallScore,
      band,
      confidence_level: confidenceLevel,
      validity_score: validityScore,
      straight_lining_flag: straightLiningFlag,
      too_fast_flag: tooFastFlag,
      report_json: reportJson,
      version,
    })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

/**
 * Paginated v1_assessment_results (all versions), newest first.
 */
async function listResults({ from, to }) {
  const { data, error, count } = await supabase
    .from("v1_assessment_results")
    .select(
      "id, session_id, user_id, version, overall_score, band, confidence_level, generated_at, profiles ( full_name, email )",
      { count: "exact" }
    )
    .order("generated_at", { ascending: false })
    .range(from, to);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return { data, count };
}

module.exports = {
  insertSessionTraitScores,
  insertSessionDepartmentScores,
  getLatestResult,
  insertResult,
  listResults,
};
