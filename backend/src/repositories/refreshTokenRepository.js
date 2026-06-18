const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function create({ userId, tokenHash, expiresAt }) {
  const { data, error } = await supabase
    .from("refresh_tokens")
    .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt.toISOString() })
    .select()
    .single();

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }

  return data;
}

async function findActiveByHash(tokenHash) {
  const { data, error } = await supabase
    .from("refresh_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }

  return data;
}

async function revoke(id) {
  const { error } = await supabase
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  }
}

module.exports = { create, findActiveByHash, revoke };
