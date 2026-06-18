const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");
const { SESSION_STATUS } = require("../constants/sessionStatus");

async function getActiveAssessment() {
  const { data, error } = await supabase
    .from("assessments")
    .select("id, code, title, version")
    .eq("is_active", true)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  if (!data) throw new AppError(500, "No active assessment is configured", ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function findInProgressSession(userId, assessmentId) {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .eq("status", SESSION_STATUS.IN_PROGRESS)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function createSession(userId, assessmentId) {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .insert({ user_id: userId, assessment_id: assessmentId, status: SESSION_STATUS.IN_PROGRESS })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getLatestSessionForUser(userId) {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function getSessionById(sessionId) {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("*, profiles ( full_name, email, roll_number, branch, passing_year )")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  if (!data) throw new AppError(404, "Assessment session not found", ERROR_CODES.NOT_FOUND);

  return data;
}

async function updateSession(sessionId, fields) {
  const { data, error } = await supabase
    .from("assessment_sessions")
    .update(fields)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

/**
 * Paginated assessment_sessions, optionally filtered by status and/or user.
 */
async function listSessions({ from, to, status, userId }) {
  let query = supabase
    .from("assessment_sessions")
    .select("id, user_id, status, started_at, completed_at, profiles ( full_name, email )", { count: "exact" })
    .order("started_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (userId) query = query.eq("user_id", userId);

  const { data, error, count } = await query;
  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return { data, count };
}

/**
 * Returns { [userId]: { total, completed } } session counts for the given user ids.
 */
async function countSessionsByUserIds(userIds) {
  if (!userIds.length) return {};

  const { data, error } = await supabase
    .from("assessment_sessions")
    .select("user_id, status")
    .in("user_id", userIds);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  const counts = {};
  for (const row of data) {
    if (!counts[row.user_id]) counts[row.user_id] = { total: 0, completed: 0 };
    counts[row.user_id].total += 1;
    if (row.status === SESSION_STATUS.COMPLETED) counts[row.user_id].completed += 1;
  }

  return counts;
}

module.exports = {
  getActiveAssessment,
  findInProgressSession,
  createSession,
  getLatestSessionForUser,
  getSessionById,
  updateSession,
  listSessions,
  countSessionsByUserIds,
};
