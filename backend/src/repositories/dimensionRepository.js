const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getAllDimensions() {
  const { data, error } = await supabase
    .from("dimensions")
    .select("id, framework, code, name, description")
    .order("framework", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getTraitDimensionWeights() {
  const { data, error } = await supabase
    .from("trait_dimension_weights")
    .select("dimension_id, weight, traits ( code )");

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({
    dimensionId: row.dimension_id,
    traitCode: row.traits.code,
    weight: Number(row.weight),
  }));
}

async function listWeightsAdmin() {
  const { data, error } = await supabase
    .from("trait_dimension_weights")
    .select("id, weight, traits ( id, code, name ), dimensions ( id, framework, code, name )")
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function updateWeight(id, weight) {
  const { data, error } = await supabase
    .from("trait_dimension_weights")
    .update({ weight })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { getAllDimensions, getTraitDimensionWeights, listWeightsAdmin, updateWeight };
