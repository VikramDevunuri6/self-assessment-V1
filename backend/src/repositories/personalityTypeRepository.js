const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveTypes() {
  const { data, error } = await supabase
    .from("personality_types")
    .select("id, code, name, description, criteria, priority")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getAllTypesAdmin() {
  const { data, error } = await supabase
    .from("personality_types")
    .select("id, code, name, description, criteria, priority, is_active")
    .order("priority", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function createType({ code, name, description, criteria, priority }) {
  const { data, error } = await supabase
    .from("personality_types")
    .insert({ code, name, description, criteria, priority })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function updateType(id, fields) {
  const { data, error } = await supabase
    .from("personality_types")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { getActiveTypes, getAllTypesAdmin, createType, updateType };
