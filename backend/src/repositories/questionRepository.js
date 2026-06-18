const supabase = require("../config/supabaseClient");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

async function getActiveQuestions() {
  const { data, error } = await supabase
    .from("questions")
    .select(
      `
      id,
      question_text,
      question_type,
      image_url,
      group_no,
      question_options ( id, option_text, option_order, image_url )
    `
    )
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map((question) => ({
    ...question,
    question_options: [...question.question_options].sort((a, b) => a.option_order - b.option_order),
  }));
}

async function getActiveQuestionCount() {
  const { count, error } = await supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return count;
}

async function getOptionForQuestion(questionId, optionId) {
  const { data, error } = await supabase
    .from("question_options")
    .select("id, question_id")
    .eq("id", optionId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

const QUESTION_ADMIN_SELECT =
  "id, question_text, question_type, image_url, group_no, is_active, category_id, trait_id, " +
  "categories ( code, name ), traits ( code, name ), " +
  "question_options ( id, option_text, option_order, score )";

const QUESTION_REVIEW_SELECT =
  "id, question_text, question_type, group_no, " +
  "categories ( code, name ), traits ( code, name ), " +
  "question_options ( id, option_text, option_order, score )";

function sortOptions(question) {
  return {
    ...question,
    question_options: [...question.question_options].sort((a, b) => a.option_order - b.option_order),
  };
}

/**
 * All questions (any active state) with category, trait and scored options,
 * for building per-session answer review/breakdown views.
 */
async function getQuestionsForReview() {
  const { data, error } = await supabase.from("questions").select(QUESTION_REVIEW_SELECT).order("id", { ascending: true });

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data.map(sortOptions);
}

async function listQuestionsAdmin({ from, to }) {
  const { data, error, count } = await supabase
    .from("questions")
    .select(QUESTION_ADMIN_SELECT, { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return { data: data.map(sortOptions), count };
}

async function getQuestionByIdAdmin(id) {
  const { data, error } = await supabase.from("questions").select(QUESTION_ADMIN_SELECT).eq("id", id).maybeSingle();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);
  if (!data) throw new AppError(404, "Question not found", ERROR_CODES.NOT_FOUND);

  return sortOptions(data);
}

async function createQuestion({ questionText, questionType, imageUrl, categoryId, traitId }) {
  const { data, error } = await supabase
    .from("questions")
    .insert({
      question_text: questionText,
      question_type: questionType,
      image_url: imageUrl ?? null,
      category_id: categoryId ?? null,
      trait_id: traitId ?? null,
    })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function updateQuestion(id, fields) {
  const { data, error } = await supabase.from("questions").update(fields).eq("id", id).select().single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function createOption({ questionId, optionText, optionOrder, score }) {
  const { data, error } = await supabase
    .from("question_options")
    .insert({ question_id: questionId, option_text: optionText, option_order: optionOrder, score })
    .select()
    .single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

async function updateOption(id, fields) {
  const { data, error } = await supabase.from("question_options").update(fields).eq("id", id).select().single();

  if (error) throw new AppError(500, error.message, ERROR_CODES.INTERNAL_ERROR);

  return data;
}

module.exports = {
  getActiveQuestions,
  getActiveQuestionCount,
  getOptionForQuestion,
  listQuestionsAdmin,
  getQuestionByIdAdmin,
  getQuestionsForReview,
  createQuestion,
  updateQuestion,
  createOption,
  updateOption,
};
