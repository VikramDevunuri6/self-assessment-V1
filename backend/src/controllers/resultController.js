const resultService = require("../services/resultService");
const pdfService = require("../services/pdfService");
const asyncHandler = require("../utils/asyncHandler");

const getResult = asyncHandler(async (req, res) => {
  const result = await resultService.getResultBySessionId(req.params.sessionId, req.user);
  res.json(result);
});

const getResultPdf = asyncHandler(async (req, res) => {
  const { report, generatedAt } = await resultService.getReportForPdf(req.params.sessionId, req.user);
  pdfService.streamReportPdf(res, { report, sessionId: req.params.sessionId, generatedAt });
});

module.exports = { getResult, getResultPdf };
