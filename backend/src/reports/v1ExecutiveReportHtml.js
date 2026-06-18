const { buildRadarSvg } = require("./charts/radarSvg");
const {
  getCareerPotential,
  getCareerChips,
  deriveWorkingStyle,
  topNTraits,
  bottomNTraits,
  formatDuration,
  formatReportId,
} = require("./v1Presentation");

const BAND_COLORS = {
  Exceptional: { fg: "#15803d", bg: "#ecfdf5" },
  Strong: { fg: "#7c3aed", bg: "#f5f3ff" },
  Developing: { fg: "#b45309", bg: "#fffbeb" },
  Emerging: { fg: "#b91c1c", bg: "#fef2f2" },
};

const CONFIDENCE_COLORS = {
  High: { fg: "#15803d", bg: "#ecfdf5" },
  Moderate: { fg: "#b45309", bg: "#fffbeb" },
  Low: { fg: "#b91c1c", bg: "#fef2f2" },
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function scoreBar(label, score) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return `
    <div class="bar-row">
      <span class="bar-label">${escapeHtml(label)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="bar-score">${pct}</span>
    </div>`;
}

function percentCard(label, score) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return `
    <div class="pct-card">
      <span class="pct-value">${pct}%</span>
      <span class="pct-label">${escapeHtml(label)}</span>
    </div>`;
}

/**
 * Builds the full one-page executive report as a standalone HTML document
 * (inline <style>, no external assets) for Puppeteer to render to PDF. Pure
 * presentation: every value comes from the already-computed report_json
 * (read-only) plus the small lookup/derivation helpers in v1Presentation.js
 * -- nothing here recalculates a score.
 */
function buildExecutiveHtml(report, meta = {}) {
  const band = BAND_COLORS[report.band] || BAND_COLORS.Strong;
  const confidence = CONFIDENCE_COLORS[report.confidence.level] || CONFIDENCE_COLORS.Moderate;

  const strengths = topNTraits(report.traits, 5);
  const growth = bottomNTraits(report.traits, 5);
  const careerPotential = getCareerPotential(report.traits);
  const careerChips = getCareerChips(report.careerSignals);
  const workingStyle = deriveWorkingStyle(report.traits);
  const duration = formatDuration(meta.startedAt, meta.completedAt);
  const reportId = formatReportId(meta.reportId);
  const generatedDate = meta.generatedAt ? new Date(meta.generatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const radarSvg = buildRadarSvg(report.traits, { size: 230 });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system, "Segoe UI", "Inter", Arial, sans-serif; color: #1e1b2e; }

  .page {
    width: 794px;
    height: 1123px;
    overflow: hidden;
    padding: 22px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .banner {
    background: linear-gradient(135deg, #1e1b2e, #3b2f63);
    color: #fff;
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .banner .brand { font-size: 15px; font-weight: 800; letter-spacing: 0.02em; }
  .banner .subtitle { font-size: 9px; color: #c4b5fd; margin-top: 2px; }
  .banner .student { text-align: right; font-size: 10px; line-height: 1.5; }
  .banner .student strong { font-size: 12px; display: block; }

  .row { display: flex; gap: 12px; }

  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 14px;
  }
  .card h4 {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b7280;
  }

  .score-card { flex: 0 0 200px; text-align: center; }
  .score-value { font-size: 46px; font-weight: 800; line-height: 1; color: #1e1b2e; }
  .score-suffix { font-size: 13px; color: #6b7280; }
  .band-pill {
    display: inline-block; margin-top: 6px; padding: 4px 14px; border-radius: 999px;
    font-size: 10px; font-weight: 800; color: ${band.fg}; background: ${band.bg};
  }

  .highlights { flex: 1; }
  .highlights-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 14px; }
  .highlight-item { font-size: 9px; color: #6b7280; }
  .highlight-item strong { display: block; font-size: 12px; color: #1e1b2e; }

  .list-card { flex: 1; }
  .list-item { display: flex; justify-content: space-between; align-items: center; padding: 5px 9px; border-radius: 8px; margin-bottom: 4px; font-size: 10px; font-weight: 700; }
  .strength-item { background: #ecfdf5; color: #15803d; }
  .growth-item { background: #fffbeb; color: #b45309; }

  .bar-row { display: grid; grid-template-columns: 1fr 2fr 22px; align-items: center; gap: 8px; margin-bottom: 6px; }
  .bar-label { font-size: 9px; font-weight: 600; color: #374151; }
  .bar-track { height: 6px; border-radius: 999px; background: #f5f3ff; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #7c3aed, #a78bfa); }
  .bar-score { font-size: 9px; font-weight: 800; text-align: right; color: #1e1b2e; }

  .radar-card { flex: 0 0 270px; display: flex; align-items: center; justify-content: center; }
  .career-potential-card { flex: 1; }

  .dept-row { display: flex; gap: 8px; }
  .pct-card { flex: 1; text-align: center; background: #f5f3ff; border-radius: 10px; padding: 8px 4px; }
  .pct-value { display: block; font-size: 15px; font-weight: 800; color: #7c3aed; }
  .pct-label { font-size: 7px; font-weight: 700; color: #6b7280; text-transform: uppercase; }

  .chips-card { flex: 1; }
  .chip { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #f5f3ff; color: #7c3aed; font-size: 9px; font-weight: 700; margin: 0 4px 4px 0; }

  .style-card { flex: 1; }
  .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .style-item { font-size: 8px; color: #6b7280; }
  .style-item strong { display: block; font-size: 10px; color: #1e1b2e; }

  .next-steps-card .step { font-size: 9px; margin-bottom: 4px; }
  .next-steps-card .step strong { color: #1e1b2e; }
  .next-steps-card .step span { color: #6b7280; }

  .confidence-pill {
    display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 9px; font-weight: 800;
    color: ${confidence.fg}; background: ${confidence.bg};
  }

  footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 7px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
</style>
</head>
<body>
  <div class="page">

    <header class="banner">
      <div>
        <div class="brand">PersonaVerse · Self-Assessment Report</div>
        <div class="subtitle">Insights for Academic Growth &amp; Future Success</div>
      </div>
      <div class="student">
        <strong>${escapeHtml(meta.studentName || "Student")}</strong>
        ${escapeHtml(meta.rollNumber || "—")} · ${escapeHtml(meta.branch || "—")} · ${escapeHtml(meta.passingYear || "—")}<br/>
        Report ${escapeHtml(reportId)} · ${escapeHtml(generatedDate)}
      </div>
    </header>

    <div class="row">
      <div class="card score-card">
        <h4>Overall Potential</h4>
        <div><span class="score-value">${report.overallScore}</span><span class="score-suffix">/100</span></div>
        <div class="band-pill">${escapeHtml(report.band)}</div>
      </div>
      <div class="card highlights">
        <h4>Report Highlights</h4>
        <div class="highlights-grid">
          <div class="highlight-item">Confidence<strong><span class="confidence-pill">${escapeHtml(report.confidence.level)}</span></strong></div>
          <div class="highlight-item">Reliability Score<strong>${Math.round(report.confidence.validityScore)}%</strong></div>
          <div class="highlight-item">Questions Answered<strong>48 / 48</strong></div>
          <div class="highlight-item">Assessment Duration<strong>${escapeHtml(duration)}</strong></div>
          <div class="highlight-item">Traits Assessed<strong>${report.traits.length}</strong></div>
          <div class="highlight-item">Status<strong>Completed</strong></div>
        </div>
        ${report.balancedProfileNote ? `<p style="margin:8px 0 0;font-size:9px;color:#6b7280;">${escapeHtml(report.balancedProfileNote)}</p>` : ""}
      </div>
    </div>

    <div class="row">
      <div class="card list-card">
        <h4>Top Strengths</h4>
        ${strengths.map((t) => `<div class="list-item strength-item"><span>${escapeHtml(t.name)}</span><span>${Math.round(t.normalizedScore)}</span></div>`).join("")}
      </div>
      <div class="card list-card">
        <h4>Key Growth Areas</h4>
        ${growth.map((t) => `<div class="list-item growth-item"><span>${escapeHtml(t.name)}</span><span>${Math.round(t.normalizedScore)}</span></div>`).join("")}
      </div>
    </div>

    <div class="row">
      <div class="card radar-card">
        <div>
          <h4 style="text-align:center;">Trait Profile</h4>
          ${radarSvg}
        </div>
      </div>
      <div class="card career-potential-card">
        <h4>Career Potential</h4>
        ${careerPotential.map((c) => scoreBar(c.label, c.score)).join("")}
      </div>
    </div>

    <div class="card">
      <h4>Department Fit</h4>
      <div class="dept-row">
        ${report.departmentFit.map((d) => percentCard(d.name, d.fitScore)).join("")}
      </div>
    </div>

    <div class="row">
      <div class="card chips-card">
        <h4>Career Recommendations</h4>
        <div>${careerChips.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join("")}</div>
      </div>
      <div class="card style-card">
        <h4>Working Style Summary</h4>
        <div class="style-grid">
          ${Object.entries(workingStyle).map(([k, v]) => `<div class="style-item">${escapeHtml(k)}<strong>${escapeHtml(v)}</strong></div>`).join("")}
        </div>
      </div>
    </div>

    <div class="card next-steps-card">
      <h4>Suggested Next Steps</h4>
      ${(report.nextSteps || []).map((s) => `<div class="step"><strong>${escapeHtml(s.title)}:</strong> <span>${escapeHtml(s.content)}</span></div>`).join("")}
    </div>

    <footer>
      <span>PersonaVerse Student Assessment · Confidential Report</span>
      <span>Generated ${escapeHtml(generatedDate)} · ${escapeHtml(reportId)}</span>
    </footer>

  </div>
</body>
</html>`;
}

module.exports = { buildExecutiveHtml };
