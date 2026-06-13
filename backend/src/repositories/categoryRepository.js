const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getAllCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, code, name, description")
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function createCategory({ code, name, description }) {
  const { data, error } = await supabase
    .from("categories")
    .insert({ code, name, description })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { getAllCategories, createCategory };
