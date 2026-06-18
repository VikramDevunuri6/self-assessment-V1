const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveRecommendations() {
  const { data, error } = await supabase
    .from("recommendations")
    .select("id, type, trait_id, dimension_id, personality_type_id, condition, title, content, priority")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getAllRecommendationsAdmin({ from, to, type }) {
  let query = supabase
    .from("recommendations")
    .select(
      "id, type, trait_id, dimension_id, personality_type_id, condition, title, content, priority, is_active",
      { count: "exact" }
    )
    .order("priority", { ascending: false })
    .range(from, to);

  if (type) query = query.eq("type", type);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return { data, count };
}

async function createRecommendation(fields) {
  const { data, error } = await supabase.from("recommendations").insert(fields).select().single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function updateRecommendation(id, fields) {
  const { data, error } = await supabase.from("recommendations").update(fields).eq("id", id).select().single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = {
  getActiveRecommendations,
  getAllRecommendationsAdmin,
  createRecommendation,
  updateRecommendation,
};
