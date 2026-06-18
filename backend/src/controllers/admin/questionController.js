const questionService = require("../../services/admin/questionService");
const asyncHandler = require("../../utils/asyncHandler");

const listQuestions = asyncHandler(async (req, res) => {
  res.json(await questionService.listQuestions(req.query));
});

const getQuestion = asyncHandler(async (req, res) => {
  res.json(await questionService.getQuestion(req.params.id));
});

const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);
  res.locals.entityId = question.id;
  res.status(201).json(question);
});

const updateQuestion = asyncHandler(async (req, res) => {
  res.json(await questionService.updateQuestion(req.params.id, req.body));
});

const deleteQuestion = asyncHandler(async (req, res) => {
  res.json(await questionService.deleteQuestion(req.params.id));
});

module.exports = { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };
