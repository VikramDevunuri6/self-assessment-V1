const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function signUpWithPassword(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new AppError(409, error.message, ERROR_CODES.CONFLICT);
  }

  return data.user;
}

async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new AppError(401, error.message, ERROR_CODES.UNAUTHORIZED);
  }

  return data.user;
}

/**
 * Creates a Supabase Auth user via the Admin API, pre-confirmed so the user
 * can log in immediately with the temporary password. Used for staff
 * accounts created by a Super Admin (and the Super Admin bootstrap script) --
 * never exposed to the public signup flow.
 */
async function createUserWithPassword(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new AppError(409, error.message, ERROR_CODES.CONFLICT);
  }

  return data.user;
}

async function deleteAuthUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }
}

module.exports = { signUpWithPassword, signInWithPassword, createUserWithPassword, deleteAuthUser };
