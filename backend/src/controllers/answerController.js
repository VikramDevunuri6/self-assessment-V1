const answerService = require("../services/answerService");
const asyncHandler = require("../utils/asyncHandler");

const saveAnswer = asyncHandler(async (req, res) => {
  const result = await answerService.saveAnswer({ ...req.body, userId: req.user.userId });
  res.json(result);
});

module.exports = { saveAnswer };
