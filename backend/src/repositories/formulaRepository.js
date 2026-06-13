const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getCurrentDefinition(formulaCode) {
  const { data, error } = await supabase
    .from("formula_versions")
    .select("definition, version, formulas!inner(code)")
    .eq("is_current", true)
    .eq("formulas.code", formulaCode)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  if (!data) throw new AppError(500, `Formula '${formulaCode}' is not configured`, ERROR_CODES.INTERNAL_ERROR);

  return data.definition;
}

async function listFormulas() {
  const { data, error } = await supabase
    .from("formulas")
    .select("id, code, name, description, is_active, formula_versions ( id, version, definition, is_current, created_at )")
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getFormulaByCode(code) {
  const { data, error } = await supabase
    .from("formulas")
    .select("id, code, name, description, is_active, formula_versions ( id, version, definition, is_current, created_at )")
    .eq("code", code)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  if (!data) throw new AppError(404, `Formula '${code}' not found`, ERROR_CODES.NOT_FOUND);

  return data;
}

/**
 * Publishes a new formula_versions row as the current version, demoting the
 * previously current version. Returns the newly created version row.
 */
async function createVersion({ formulaId, definition, createdBy }) {
  const { data: versions, error: versionsError } = await supabase
    .from("formula_versions")
    .select("version")
    .eq("formula_id", formulaId)
    .order("version", { ascending: false })
    .limit(1);

  if (versionsError) throw new AppError(500, versionsError.message, ERROR_CODES.INTERNAL_ERROR);

  const nextVersion = (versions[0]?.version || 0) + 1;

  const { error: clearError } = await supabase
    .from("formula_versions")
    .update({ is_current: false })
    .eq("formula_id", formulaId)
    .eq("is_current", true);

  if (clearError) throw new AppError(500, clearError.message, ERROR_CODES.INTERNAL_ERROR);

  const { data, error } = await supabase
    .from("formula_versions")
    .insert({ formula_id: formulaId, version: nextVersion, definition, is_current: true, created_by: createdBy })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = { getCurrentDefinition, listFormulas, getFormulaByCode, createVersion };
