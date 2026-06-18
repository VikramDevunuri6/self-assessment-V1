const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getScoreBands() {
  const { data, error } = await supabase
    .from("v1_score_bands")
    .select("label, min_score, max_score, display_order")
    .order("display_order", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({
    label: row.label,
    minScore: row.min_score,
    maxScore: row.max_score,
  }));
}

async function getEngineConfig() {
  const { data, error } = await supabase.from("v1_engine_config").select("key, value");

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  const config = {};
  for (const row of data) config[row.key] = Number(row.value);

  return {
    highThreshold: config.high_threshold,
    lowThreshold: config.low_threshold,
    balancedSpreadThreshold: config.balanced_spread_threshold,
  };
}

async function getTraitTips() {
  const { data, error } = await supabase.from("v1_trait_tips").select("trait_id, tip_text");

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  const tips = {};
  for (const row of data) tips[row.trait_id] = row.tip_text;

  return tips;
}

module.exports = { getScoreBands, getEngineConfig, getTraitTips };
