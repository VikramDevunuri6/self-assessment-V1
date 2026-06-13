const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getRoleByCode(code) {
  const { data, error } = await supabase.from("roles").select("id, code, name").eq("code", code).single();

  if (error) {
    throw new AppError(500, `Role '${code}' is not configured`, ERROR_CODES.INTERNAL_ERROR);
  }

  return data;
}

async function getRolesForUser(userId) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles ( code, name )")
    .eq("user_id", userId);

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }

  return data.map((row) => row.roles);
}

async function assignRole(userId, roleId) {
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role_id: roleId });

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }
}

/**
 * Replaces a user's role assignments with a single role (single-role-per-user
 * model). Deletes any existing `user_roles` rows for the user, then assigns
 * the given role code.
 */
async function setUserRole(userId, roleCode) {
  const role = await getRoleByCode(roleCode);

  const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (deleteError) {
    throw new AppError(500, deleteError.message, ERROR_CODES.INTERNAL_ERROR);
  }

  await assignRole(userId, role.id);
}

module.exports = { getRoleByCode, getRolesForUser, assignRole, setUserRole };
