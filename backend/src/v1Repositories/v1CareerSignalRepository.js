const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveRules() {
  const { data, error } = await supabase
    .from("v1_career_signal_rules")
    .select("id, label, rationale, conditions, priority")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    rationale: row.rationale,
    conditions: row.conditions,
  }));
}

module.exports = { getActiveRules };
