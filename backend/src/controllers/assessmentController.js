const assessmentService = require("../services/assessmentService");
const asyncHandler = require("../utils/asyncHandler");

const getLatest = asyncHandler(async (req, res) => {
  const result = await assessmentService.getLatestSession(req.user.userId);
  res.json(result);
});

const start = asyncHandler(async (req, res) => {
  const result = await assessmentService.startAssessment(req.user.userId);
  res.status(201).json(result);
});

const submit = asyncHandler(async (req, res) => {
  const result = await assessmentService.submitAssessment(req.body.sessionId, req.user.userId);
  res.json(result);
});

module.exports = { getLatest, start, submit };
