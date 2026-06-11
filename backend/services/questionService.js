const supabase = require("../config/supabaseClient");

async function getAllQuestions() {
  const { data, error } = await supabase.from("questions").select(`
      *,
      question_options (*)
    `);

  if (error) throw error;

  return data;
}

module.exports = { getAllQuestions };
