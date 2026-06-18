const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function recordPdfGeneration({ resultId, sessionId, userId, reportJson, generatedBy }) {
  const { data, error } = await supabase
    .from("report_history")
    .insert({
      result_id: resultId,
      session_id: sessionId,
      user_id: userId,
      report_json: reportJson,
      pdf_generated_at: new Date().toISOString(),
      generated_by: generatedBy,
    })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function recordRegeneration({ resultId, sessionId, userId, reportJson, generatedBy }) {
  const { data, error } = await supabase
    .from("report_history")
    .insert({
      result_id: resultId,
      session_id: sessionId,
      user_id: userId,
      report_json: reportJson,
      generated_by: generatedBy,
    })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { recordPdfGeneration, recordRegeneration };
