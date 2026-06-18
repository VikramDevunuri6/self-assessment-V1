const questionRepository = require("../../repositories/questionRepository");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

function mapQuestion(question) {
  return {
    id: question.id,
    questionText: question.question_text,
    questionType: question.question_type,
    imageUrl: question.image_url,
    groupNo: question.group_no,
    isActive: question.is_active,
    category: question.categories ? { code: question.categories.code, name: question.categories.name } : null,
    trait: question.traits ? { code: question.traits.code, name: question.traits.name } : null,
    categoryId: question.category_id,
    traitId: question.trait_id,
    options: question.question_options.map((option) => ({
      id: option.id,
      optionText: option.option_text,
      optionOrder: option.option_order,
      score: Number(option.score),
    })),
  };
}

async function listQuestions(query) {
  const pagination = parsePagination(query);
  const { data, count } = await questionRepository.listQuestionsAdmin(pagination);

  return { questions: data.map(mapQuestion), pagination: buildPaginationMeta(pagination, count) };
}

async function getQuestion(id) {
  return mapQuestion(await questionRepository.getQuestionByIdAdmin(id));
}

async function createQuestion({ questionText, questionType, imageUrl, categoryId, traitId, options }) {
  const question = await questionRepository.createQuestion({ questionText, questionType, imageUrl, categoryId, traitId });

  if (options?.length) {
    await Promise.all(
      options.map((option, index) =>
        questionRepository.createOption({
          questionId: question.id,
          optionText: option.optionText,
          optionOrder: option.optionOrder ?? index + 1,
          score: option.score ?? 0,
        })
      )
    );
  }

  return getQuestion(question.id);
}

async function updateQuestion(id, { questionText, questionType, imageUrl, categoryId, traitId, isActive, options }) {
  const fields = {};
  if (questionText !== undefined) fields.question_text = questionText;
  if (questionType !== undefined) fields.question_type = questionType;
  if (imageUrl !== undefined) fields.image_url = imageUrl;
  if (categoryId !== undefined) fields.category_id = categoryId;
  if (traitId !== undefined) fields.trait_id = traitId;
  if (isActive !== undefined) fields.is_active = isActive;

  if (Object.keys(fields).length) {
    await questionRepository.updateQuestion(id, fields);
  }

  if (options?.length) {
    await Promise.all(
      options.map((option) => {
        const optionFields = {};
        if (option.optionText !== undefined) optionFields.option_text = option.optionText;
        if (option.optionOrder !== undefined) optionFields.option_order = option.optionOrder;
        if (option.score !== undefined) optionFields.score = option.score;
        return questionRepository.updateOption(option.id, optionFields);
      })
    );
  }

  return getQuestion(id);
}

async function deleteQuestion(id) {
  await questionRepository.updateQuestion(id, { is_active: false });
  return { id, isActive: false };
}

module.exports = { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };
