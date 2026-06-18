const v1ResultService = require("../services/v1ResultService");
const v1PdfService = require("../services/v1PdfService");
const asyncHandler = require("../utils/asyncHandler");

const getResult = asyncHandler(async (req, res) => {
  const result = await v1ResultService.getResultBySessionId(req.params.sessionId, req.user);
  res.json(result);
});

const getResultPdf = asyncHandler(async (req, res) => {
  const { report, generatedAt, meta } = await v1ResultService.getReportForPdf(req.params.sessionId, req.user);
  await v1PdfService.streamReportPdf(res, { report, sessionId: req.params.sessionId, generatedAt, meta });
});

module.exports = { getResult, getResultPdf };
