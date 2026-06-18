const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function record({ adminId, action, entityType, entityId, metadata }) {
  const { error } = await supabase.from("admin_activity_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId === undefined || entityId === null ? null : String(entityId),
    metadata: metadata || {},
  });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
}

async function listLogs({ from, to }) {
  const { data, error, count } = await supabase
    .from("admin_activity_logs")
    .select("id, admin_id, action, entity_type, entity_id, metadata, created_at, profiles ( full_name, email )", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return { data, count };
}

module.exports = { record, listLogs };
