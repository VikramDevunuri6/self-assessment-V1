const PDFDocument = require("pdfkit");
const { renderReport } = require("../reports/personalityReportTemplate");

/**
 * Streams a PDF rendering of a stored report_json directly to the HTTP response.
 */
function streamReportPdf(res, { report, sessionId, generatedAt }) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="assessment-report-${sessionId}.pdf"`);

  doc.pipe(res);
  renderReport(doc, report, { sessionId, generatedAt });
  doc.end();
}

module.exports = { streamReportPdf };
