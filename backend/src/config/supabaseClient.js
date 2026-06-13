const { createClient } = require("@supabase/supabase-js");
const env = require("./env");
const logger = require("./logger");

logger.info(`[supabase] connecting to ${env.SUPABASE_URL}`);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
