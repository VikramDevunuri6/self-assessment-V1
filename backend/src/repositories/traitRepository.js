const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveTraits() {
  const { data, error } = await supabase
    .from("traits")
    .select("id, code, name, description")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getAllTraits() {
  const { data, error } = await supabase
    .from("traits")
    .select("id, code, name, description, is_active")
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function createTrait({ code, name, description }) {
  const { data, error } = await supabase.from("traits").insert({ code, name, description }).select().single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function updateTrait(id, fields) {
  const { data, error } = await supabase.from("traits").update(fields).eq("id", id).select().single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { getActiveTraits, getAllTraits, createTrait, updateTrait };
