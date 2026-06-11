const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    `Missing Supabase env vars: ${!supabaseUrl ? "SUPABASE_URL " : ""}${
      !supabaseServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : ""
    }`.trim()
  );
}

console.log(
  `[supabase] connecting to ${supabaseUrl} with key ending in ...${supabaseServiceRoleKey.slice(-6)}`
);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
