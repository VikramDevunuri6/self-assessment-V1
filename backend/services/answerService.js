const supabase = require("../config/supabaseClient");

async function submitAnswers(userId, answers) {
  const rows = answers.map(({ questionId, optionId }) => ({
    user_id: userId,
    question_id: questionId,
    option_id: optionId,
  }));

  const { data, error } = await supabase
    .from("answers")
    .upsert(rows, { onConflict: "user_id,question_id" })
    .select();

  if (error) throw error;

  return data;
}

module.exports = { submitAnswers };
