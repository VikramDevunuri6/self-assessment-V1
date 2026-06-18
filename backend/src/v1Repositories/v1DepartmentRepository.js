const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveDepartments() {
  const { data, error } = await supabase
    .from("v1_departments")
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

async function getDepartmentTraitWeights() {
  const { data, error } = await supabase
    .from("v1_department_trait_weights")
    .select("department_id, weight, v1_traits ( code )");

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((row) => ({
    departmentId: row.department_id,
    traitCode: row.v1_traits.code,
    weight: Number(row.weight),
  }));
}

module.exports = { getActiveDepartments, getDepartmentTraitWeights };
