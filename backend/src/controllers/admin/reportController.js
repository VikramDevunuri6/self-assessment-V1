const reportService = require("../../services/admin/reportService");
const asyncHandler = require("../../utils/asyncHandler");

const listReports = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.query);
  res.json(result);
});

const getReport = asyncHandler(async (req, res) => {
  const result = await reportService.getReportDetail(req.params.sessionId);
  res.json(result);
});

const regenerateReport = asyncHandler(async (req, res) => {
  const result = await reportService.regenerateReport(req.body.sessionId, req.user.userId);
  res.json(result);
});

const getAnswerSheet = asyncHandler(async (req, res) => {
  const result = await reportService.getAnswerSheet(req.params.sessionId);
  res.json(result);
});

const getBreakdown = asyncHandler(async (req, res) => {
  const result = await reportService.getScoreBreakdown(req.params.sessionId);
  res.json(result);
});

module.exports = { listReports, getReport, regenerateReport, getAnswerSheet, getBreakdown };
