const assessmentService = require("../services/assessmentService");
const asyncHandler = require("../utils/asyncHandler");

const getQuestionsForSession = asyncHandler(async (req, res) => {
  const result = await assessmentService.getQuestionsForSession(req.params.sessionId, req.user.userId);
  res.json(result);
});

module.exports = { getQuestionsForSession };
