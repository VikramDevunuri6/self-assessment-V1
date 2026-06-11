import { supabase } from "../lib/supabase";

export async function getQuestions() {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      question_options (*)
    `);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) throw error;

  return data;
}