const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveTraits() {
  const { data, error } = await supabase
    .from("v1_traits")
    .select("id, code, name, description, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
  }));
}

async function getTraitQuestionMap() {
  const { data, error } = await supabase.from("v1_trait_questions").select("trait_id, group_no");

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({ traitId: row.trait_id, groupNo: row.group_no }));
}

async function getValidityGroupNos() {
  const { data, error } = await supabase.from("v1_validity_questions").select("group_no");

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => row.group_no);
}

module.exports = { getActiveTraits, getTraitQuestionMap, getValidityGroupNos };
