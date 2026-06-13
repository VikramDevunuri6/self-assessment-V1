const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

const FETCH_LIMIT = 10000;

async function getCache(cacheKey) {
  const { data, error } = await supabase
    .from("analytics_cache")
    .select("payload, expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  return data.payload;
}

async function setCache(cacheKey, payload, ttlSeconds) {
  const now = new Date();
  const { error } = await supabase.from("analytics_cache").upsert(
    {
      cache_key: cacheKey,
      payload,
      computed_at: now.toISOString(),
      expires_at: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
    },
    { onConflict: "cache_key" }
  );

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
}

async function countProfilesByRole(roleCode) {
  const { count, error } = await supabase
    .from("user_roles")
    .select("user_id, roles!inner ( code )", { count: "exact", head: true })
    .eq("roles.code", roleCode);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return count ?? 0;
}

async function countSessions({ status } = {}) {
  let query = supabase.from("assessment_sessions").select("id", { count: "exact", head: true });
  if (status) query = query.eq("status", status);

  const { count, error } = await query;
  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return count ?? 0;
}

async function getSessionsSince(sinceIso) {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("id, user_id, status, started_at, completed_at")
    .gte("started_at", sinceIso)
    .range(0, FETCH_LIMIT - 1);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getAllResults() {
  const { data, error } = await supabase
    .from("assessment_results")
    .select("id, session_id, report_json, generated_at")
    .range(0, FETCH_LIMIT - 1);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getPdfGeneratedSessionIds() {
  const { data, error } = await supabase
    .from("report_history")
    .select("session_id")
    .not("pdf_generated_at", "is", null)
    .range(0, FETCH_LIMIT - 1);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = {
  getCache,
  setCache,
  countProfilesByRole,
  countSessions,
  getSessionsSince,
  getAllResults,
  getPdfGeneratedSessionIds,
};
