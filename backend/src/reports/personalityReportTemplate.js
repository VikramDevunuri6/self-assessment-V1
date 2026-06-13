const COLORS = {
  primary: "#4338ca",
  text: "#1f2933",
  muted: "#6b7280",
  track: "#e5e7eb",
};

const FRAMEWORK_LABELS = {
  big_five: "Big Five",
  riasec: "RIASEC",
};

function drawHeading(doc, text) {
  doc.moveDown(1);
  doc.fontSize(14).fillColor(COLORS.primary).text(text);
  doc.moveDown(0.3);
  doc.fillColor(COLORS.text);
}

function drawScoreBar(doc, label, score) {
  const barWidth = 300;
  const barHeight = 8;
  const x = doc.x;

  doc.fontSize(10).fillColor(COLORS.text).text(label);

  const barY = doc.y + 2;
  doc.rect(x, barY, barWidth, barHeight).fill(COLORS.track);

  const filled = (Math.max(0, Math.min(100, score)) / 100) * barWidth;
  if (filled > 0) {
    doc.rect(x, barY, filled, barHeight).fill(COLORS.primary);
  }

  doc.fillColor(COLORS.text).fontSize(10).text(`${Math.round(score)}`, x + barWidth + 10, barY - 2);
  doc.y = barY + barHeight + 8;
  doc.x = x;
  doc.fillColor(COLORS.text);
}

function drawList(doc, items, emptyText) {
  if (!items || items.length === 0) {
    doc.fontSize(10).fillColor(COLORS.muted).text(emptyText);
    doc.fillColor(COLORS.text);
    return;
  }

  for (const item of items) {
    doc.fontSize(11).fillColor(COLORS.text).text(`• ${item.title}`);
    if (item.content) {
      doc.fontSize(9).fillColor(COLORS.muted).text(item.content, { indent: 14 });
      doc.fillColor(COLORS.text);
    }
    doc.moveDown(0.3);
  }
}

/**
 * Renders the assessment_results.report_json shape into the given pdfkit document.
 * Pure presentation only — never recalculates scores.
 */
function renderReport(doc, report, meta = {}) {
  doc.fontSize(20).fillColor(COLORS.primary).text("Personality & Career Assessment Report");
  doc.moveDown(0.2);

  doc.fontSize(10).fillColor(COLORS.muted);
  if (meta.generatedAt) {
    doc.text(`Generated: ${new Date(meta.generatedAt).toLocaleString()}`);
  }
  if (meta.sessionId) {
    doc.text(`Session: ${meta.sessionId}`);
  }
  doc.fillColor(COLORS.text);

  drawHeading(doc, `Personality Type: ${report.personalityType?.name ?? "—"}`);
  if (report.personalityType?.description) {
    doc.fontSize(11).text(report.personalityType.description);
  }
  doc.moveDown(0.3);
  doc.fontSize(11).text(`Confidence: ${Math.round(report.confidence ?? 0)}%`);

  drawHeading(doc, "Trait Scores");
  for (const trait of report.scores?.traits ?? []) {
    drawScoreBar(doc, trait.name, trait.score);
  }

  for (const [framework, dimensions] of Object.entries(report.scores?.dimensions ?? {})) {
    drawHeading(doc, `${FRAMEWORK_LABELS[framework] ?? framework} Dimensions`);
    for (const dimension of dimensions) {
      drawScoreBar(doc, dimension.name, dimension.score);
    }
  }

  drawHeading(doc, "Strengths");
  drawList(doc, report.strengths, "No strengths identified.");

  drawHeading(doc, "Areas for Growth");
  drawList(doc, report.weaknesses, "No growth areas identified.");

  drawHeading(doc, "Career Suggestions");
  drawList(doc, report.careerSuggestions, "No career suggestions available.");

  drawHeading(doc, "Learning Recommendations");
  drawList(doc, report.learningRecommendations, "No learning recommendations available.");

  drawHeading(doc, "Interview Focus Areas");
  drawList(doc, report.interviewFocusAreas, "No interview focus areas identified.");
}

module.exports = { renderReport };
