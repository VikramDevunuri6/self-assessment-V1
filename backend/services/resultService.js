const supabase = require("../config/supabaseClient");

async function getResultsByUserId(userId) {
  const { data, error } = await supabase
    .from("answers")
    .select(
      `
      *,
      questions ( question_text ),
      question_options ( option_text )
    `
    )
    .eq("user_id", userId);

  if (error) throw error;

  return data;
}

module.exports = { getResultsByUserId };
