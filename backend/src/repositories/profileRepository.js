const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { ROLES } = require("../constants/roles");

async function createProfile(profile) {
  const { data, error } = await supabase.from("profiles").insert(profile).select().single();

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }

  return data;
}

async function getProfileById(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    throw new AppError(404, "Profile not found", ERROR_CODES.NOT_FOUND);
  }

  return data;
}

/**
 * Paginated list of student profiles (role = student), optionally filtered
 * by a case-insensitive match on full name or email.
 */
async function listStudents({ from, to, search }) {
  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, email, roll_number, branch, passing_year, user_roles!inner ( roles!inner ( code ) )",
      { count: "exact" }
    )
    .eq("user_roles.roles.code", ROLES.STUDENT)
    .order("full_name", { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return {
    data: data.map(({ user_roles, ...profile }) => profile),
    count,
  };
}

/**
 * Paginated list of every user profile (any role), with their primary role
 * code and active status, optionally filtered by a case-insensitive match
 * on full name or email. Used by the Super Admin "User Management" screen.
 */
async function listAllUsers({ from, to, search }) {
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, is_active, created_at, user_roles ( roles ( code, name ) )", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return {
    data: data.map(({ user_roles, ...profile }) => ({
      ...profile,
      role: user_roles?.[0]?.roles?.code ?? null,
    })),
    count,
  };
}

async function setActive(userId, isActive) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function deleteProfile(userId) {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
}

module.exports = { createProfile, getProfileById, listStudents, listAllUsers, setActive, deleteProfile };
