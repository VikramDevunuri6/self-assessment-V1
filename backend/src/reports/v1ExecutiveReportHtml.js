const { buildDonutSvg } = require("./charts/donutSvg");
const { icon } = require("./charts/icons");
const { buildScoreRingSvg } = require("./charts/scoreRing");
const { avatarIllustration, mountainTrophyIllustration, growthFlagIllustration, finaleTrophyIllustration } = require("./charts/illustrations");
const {
  getCareerPotential,
  getCareerChips,
  deriveWorkingStyle,
  getMindsetIndicators,
  getMindsetSummary,
  getInterviewFocusAreas,
  getLearningRecommendations,
  getDeptIcon,
  getDeptColor,
  topNTraits,
  bottomNTraits,
  formatDuration,
  formatReportId,
  formatStudentId,
} = require("./v1Presentation");

/** Brand palette (PersonaVerse V2.1 visual spec). */
const BLUE = "#0F3DDE";
const NAVY = "#081C5A";
const PURPLE = "#7B3FE4";
const GREEN = "#27AE60";
const ORANGE = "#FF8A00";
const CYAN = "#2CB7F5";
const PINK = "#F64C72";
const BG = "#F4F6FB";

const BAND_COLORS = {
  Exceptional: { fg: GREEN, bg: "#EAFBF0", ring: GREEN },
  Strong: { fg: BLUE, bg: "#EAF0FF", ring: BLUE },
  Developing: { fg: ORANGE, bg: "#FFF3E6", ring: ORANGE },
  Emerging: { fg: PINK, bg: "#FFEAF0", ring: PINK },
};

const CONFIDENCE_COLORS = {
  High: { fg: GREEN, bg: "#EAFBF0" },
  Moderate: { fg: ORANGE, bg: "#FFF3E6" },
  Low: { fg: PINK, bg: "#FFEAF0" },
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function badge(name, size = 26) {
  return `<span class="ic" style="width:${size}px;height:${size}px;">${icon(name)}</span>`;
}

/**
 * Wraps an icon in an explicitly pixel-sized inline box. Needed anywhere
 * the icon sits directly inside an auto-height flex item (list rows,
 * bullet lines, footer contact text) -- without an explicit-size parent,
 * the raw <svg width="100%" height="100%"> has nothing to resolve its
 * percentage height against and balloons to fill the row.
 */
function sizedIcon(name, size) {
  return `<span style="display:inline-flex;flex:0 0 auto;width:${size}px;height:${size}px;">${icon(name)}</span>`;
}

function tintBadge(name, color, size = 30, iconSize) {
  return `<span class="icon-badge" style="width:${size}px;height:${size}px;background:${color}1f;color:${color};">${sizedIcon(name, iconSize || Math.round(size * 0.52))}</span>`;
}

function progressBar(pct, colorFrom = PURPLE, colorTo = "#A87FF0") {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="bar-track"><div class="bar-fill" style="width:${v}%;background:linear-gradient(90deg, ${colorFrom}, ${colorTo})"></div></div>`;
}

/** Shared label/value row used by the profile card, working-style card and footer assessment-details column. */
function kvRow(name, color, label, value) {
  return `<div class="kv-row">${tintBadge(name, color, 26, 13)}<span class="kv-label">${escapeHtml(label)}</span><span class="kv-value">${escapeHtml(value)}</span></div>`;
}

/**
 * Builds the full one-page executive report as a standalone HTML document
 * (inline <style>, no external assets) for Puppeteer to render to a single
 * tall PDF page. Pure presentation: every value comes from the
 * already-computed report_json (read-only) plus the lookup/derivation
 * helpers in v1Presentation.js -- nothing here recalculates a score.
 */
function buildExecutiveHtml(report, meta = {}) {
  const band = BAND_COLORS[report.band] || BAND_COLORS.Strong;
  const confidence = CONFIDENCE_COLORS[report.confidence.level] || CONFIDENCE_COLORS.Moderate;

  const strengths = topNTraits(report.traits, 5);
  const growth = bottomNTraits(report.traits, 5);
  const careerPotential = getCareerPotential(report.traits);
  const careerChips = getCareerChips(report.careerSignals);
  const workingStyle = deriveWorkingStyle(report.traits);
  const mindset = getMindsetIndicators(report.traits);
  const mindsetSummary = getMindsetSummary(mindset);
  const interviewFocus = getInterviewFocusAreas(report.growthAreas);
  const learningRecs = getLearningRecommendations(report.growthAreas);
  const duration = formatDuration(meta.startedAt, meta.completedAt);
  const reportId = formatReportId(meta.reportId);
  const studentId = formatStudentId(meta.reportId);
  const generatedDate = meta.generatedAt
    ? new Date(meta.generatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const { svg: donutSvgMarkup, shares: traitShares } = buildDonutSvg(report.traits, { size: 230 });
  const overallPct = Math.max(0, Math.min(100, Math.round(report.overallScore)));
  const traitCoveragePct = Math.round((report.traits.length / 13) * 100);
  const scoreRingSvg = buildScoreRingSvg(overallPct, { size: 176, stroke: 16, colorFrom: BLUE, colorTo: CYAN });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Inter", "Manrope", -apple-system, "Segoe UI", Arial, sans-serif; color: #1A2238; background: ${BG}; }

  .page {
    width: 860px;
    padding: 28px 32px 36px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ic { display: inline-flex; }
  .ic svg { width: 100%; height: 100%; }

  .icon-badge { border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: 0 0 auto; }

  .row { display: flex; gap: 18px; }
  .row > .card { min-width: 0; }
  .col { flex: 1; min-width: 0; }

  .card {
    background: #fff;
    border-radius: 18px;
    padding: 22px 24px;
    box-shadow: 0 2px 14px rgba(15,30,90,0.06);
  }
  .card-title { display: flex; align-items: center; gap: 9px; margin: 0 0 16px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #5B6477; }
  .card-title .icon-badge { width: 26px; height: 26px; border-radius: 8px; }
  .card-title .icon-badge .ic { width: 14px; height: 14px; }

  /* ---------- Header ---------- */
  .header {
    background: #fff;
    border-radius: 18px;
    padding: 20px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 14px rgba(15,30,90,0.06);
  }
  .header .brandblock { display: flex; align-items: center; gap: 13px; }
  .header .logo { width: 46px; height: 46px; border-radius: 13px; background: linear-gradient(135deg, ${BLUE}, ${CYAN}); display: flex; align-items: center; justify-content: center; color: #fff; }
  .header .logo .ic { width: 25px; height: 25px; }
  .header .brandname { font-size: 19px; font-weight: 800; color: ${NAVY}; line-height: 1.15; }
  .header .tagline { font-size: 11px; color: #8993AC; margin-top: 1px; font-weight: 600; }
  .header .title { text-align: center; }
  .header .title h1 { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: 0.04em; color: ${NAVY}; }
  .header .title div { font-size: 11px; color: #8993AC; margin-top: 3px; font-weight: 600; }
  .header .right { text-align: right; }
  .header .right .datepill { display: flex; align-items: center; justify-content: flex-end; gap: 6px; font-size: 11.5px; color: #5B6477; font-weight: 700; }
  .header .right .datepill .ic { width: 13px; height: 13px; color: ${BLUE}; }
  .header .confbadge { display: inline-block; margin-top: 7px; padding: 4px 12px; border-radius: 999px; background: #EAF0FF; color: ${BLUE}; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; }

  /* ---------- Shared label/value row (profile / working style / footer) ---------- */
  .kv-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F1F3F8; }
  .kv-row:last-child { border-bottom: none; }
  .kv-label { flex: 1; font-size: 12px; color: #8993AC; font-weight: 600; }
  .kv-value { font-size: 13.5px; font-weight: 800; color: #1A2238; text-align: right; }

  /* ---------- Profile / score / highlights row ---------- */
  .profile-card { flex: 0 0 260px; }
  .profile-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .avatar { width: 64px; height: 64px; flex: 0 0 auto; }
  .profile-name { display: flex; align-items: center; gap: 6px; font-size: 17px; font-weight: 800; color: #1A2238; line-height: 1.2; }
  .profile-name .ic { width: 14px; height: 14px; color: ${ORANGE}; }
  .profile-tag { font-size: 11px; color: ${BLUE}; font-weight: 700; margin-top: 2px; }

  .score-card { flex: 0 0 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .score-ring-wrap { position: relative; width: 176px; height: 176px; margin-top: 6px; }
  .score-ring-wrap svg { position: absolute; inset: 0; }
  .score-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-ring-center b { font-size: 46px; font-weight: 800; line-height: 1; color: #1A2238; }
  .score-ring-center span { font-size: 12px; color: #9AA3B5; font-weight: 700; margin-top: 2px; }
  .band-pill { display: inline-block; margin-top: 12px; padding: 5px 16px; border-radius: 999px; font-size: 13px; font-weight: 800; color: ${band.fg}; background: ${band.bg}; }
  .score-desc { font-size: 11.5px; color: #6B7280; margin-top: 8px; line-height: 1.4; max-width: 200px; }

  .highlights-card { flex: 1; }
  .highlights-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px 18px; }
  .hl-item { display: flex; align-items: center; gap: 10px; }
  .hl-text { font-size: 11px; color: #9AA3B5; font-weight: 600; line-height: 1.2; }
  .hl-text strong { display: block; font-size: 14px; color: #1A2238; font-weight: 800; margin-top: 1px; }
  .confidence-pill { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; color: ${confidence.fg}; background: ${confidence.bg}; }
  .balanced-note { display: flex; align-items: center; gap: 8px; margin: 16px 0 0; font-size: 11px; color: ${PURPLE}; background: #F4EEFF; border-radius: 10px; padding: 8px 12px; font-weight: 600; }
  .balanced-note .ic { width: 13px; height: 13px; flex: 0 0 auto; }

  /* ---------- Strengths / growth ---------- */
  .list-card .card-head { display: flex; align-items: center; gap: 18px; }
  .list-illu { flex: 0 0 116px; width: 116px; height: 92px; }
  .item-list { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .item-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #F1F3F8; }
  .item-row:last-child { border-bottom: none; }
  .item-row .ic { width: 15px; height: 15px; flex: 0 0 auto; }
  .item-row .nm { flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: #2B3350; }
  .score-pip { flex: 0 0 auto; min-width: 40px; text-align: center; padding: 3px 9px; border-radius: 999px; font-size: 12.5px; font-weight: 800; }
  .strength-row .ic { color: ${GREEN}; }
  .strength-row .score-pip { background: #EAFBF0; color: ${GREEN}; }
  .growth-row .ic { color: ${ORANGE}; }
  .growth-row .score-pip { background: #FFF3E6; color: ${ORANGE}; }

  /* ---------- Donut + potential areas ---------- */
  .donut-card { flex: 0 0 330px; display: flex; flex-direction: column; align-items: center; }
  .donut-wrap { flex: 0 0 auto; position: relative; width: 230px; height: 230px; }
  .donut-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .donut-center .icon-badge { width: 58px; height: 58px; background: ${PURPLE}1f; color: ${PURPLE}; border-radius: 50%; }
  .donut-center .icon-badge .ic { width: 28px; height: 28px; }
  .legend { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 9px 16px; width: 100%; margin-top: 18px; }
  .legend-item { display: flex; align-items: flex-start; gap: 7px; font-size: 10.5px; color: #4B5563; font-weight: 600; line-height: 1.3; }
  .legend-dot { width: 9px; height: 9px; border-radius: 3px; flex: 0 0 auto; margin-top: 2.5px; }
  .legend-item .nm { flex: 1; min-width: 0; }
  .legend-item .pc { flex: 0 0 auto; font-weight: 800; color: #1A2238; }

  .potential-card { flex: 1; }
  .potential-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .potential-row:last-child { margin-bottom: 0; }
  .potential-text { flex: 0 0 190px; }
  .potential-text .ptitle { font-size: 13px; font-weight: 800; color: #1A2238; }
  .potential-text .pdesc { font-size: 10.5px; color: #9AA3B5; margin-top: 1px; }
  .bar-track { flex: 1; height: 9px; border-radius: 999px; background: #F1EEFB; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; }
  .potential-score { flex: 0 0 40px; text-align: right; font-size: 14px; font-weight: 800; color: #1A2238; }

  /* ---------- Department fit ---------- */
  .dept-row { display: flex; flex-wrap: wrap; gap: 18px 12px; }
  .dept-item { flex: 1 1 150px; text-align: center; padding: 10px 6px; border-radius: 14px; background: #FAFBFE; }
  .dept-item .icon-badge { width: 40px; height: 40px; border-radius: 50%; margin: 0 auto 8px; }
  .dept-item .icon-badge .ic { width: 21px; height: 21px; }
  .dept-item .pct { display: block; font-size: 25px; font-weight: 800; line-height: 1; }
  .dept-item .nm { font-size: 11px; font-weight: 700; color: #6B7280; margin-top: 4px; display: block; }

  /* ---------- Working style / mindset ---------- */
  .mindset-tiles { display: flex; justify-content: space-between; gap: 10px; }
  .mindset-tile { flex: 1; text-align: center; }
  .mindset-tile .icon-badge { width: 44px; height: 44px; border-radius: 50%; margin: 0 auto 8px; }
  .mindset-tile .icon-badge .ic { width: 22px; height: 22px; }
  .mindset-tile .mscore { font-size: 18px; font-weight: 800; color: #1A2238; }
  .mindset-tile .mlabel { font-size: 10.5px; color: #8993AC; font-weight: 700; margin-top: 1px; }
  .mindset-callout { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 12px 16px; border-radius: 12px; background: #F4EEFF; color: ${NAVY}; font-size: 11.5px; font-weight: 600; line-height: 1.4; }
  .mindset-callout .ic { width: 17px; height: 17px; flex: 0 0 auto; color: ${PURPLE}; }

  /* ---------- Triple row: interview / learning / next steps ---------- */
  .plain-list { margin: 0; padding: 0; list-style: none; }
  .plain-list li { display: flex; gap: 9px; align-items: flex-start; font-size: 11.5px; color: #4B5563; line-height: 1.4; margin-bottom: 9px; font-weight: 500; }
  .plain-list li:last-child { margin-bottom: 0; }
  .plain-list li .ic { width: 13px; height: 13px; margin-top: 2px; flex: 0 0 auto; }
  .plain-list li strong { color: #1A2238; }
  .sub-title { display: flex; align-items: center; gap: 8px; margin: 18px 0 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #5B6477; }
  .sub-title .icon-badge { width: 22px; height: 22px; border-radius: 7px; }
  .sub-title .icon-badge .ic { width: 12px; height: 12px; }

  /* ---------- Overall recommendation banner ---------- */
  .reco-banner { background: linear-gradient(120deg, ${NAVY} 0%, #122B7A 100%); border-radius: 18px; padding: 22px 28px; display: flex; align-items: center; gap: 22px; color: #fff; }
  .reco-trophy { flex: 0 0 84px; width: 84px; height: 84px; }
  .reco-headline { flex: 0 0 230px; }
  .reco-headline .h1 { font-size: 16px; font-weight: 800; letter-spacing: 0.02em; line-height: 1.3; }
  .reco-headline .h2 { font-size: 11px; color: #C3CEEE; line-height: 1.4; margin-top: 6px; }
  .reco-metrics { flex: 1; display: flex; justify-content: space-around; }
  .reco-metric { text-align: center; }
  .reco-metric .icon-badge { margin: 0 auto 6px; width: 32px; height: 32px; border-radius: 50%; }
  .reco-metric .icon-badge .ic { width: 16px; height: 16px; }
  .reco-metric .v { font-size: 19px; font-weight: 800; color: #fff; }
  .reco-metric .l { font-size: 9.5px; color: #AEB9DC; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin-top: 2px; }

  /* ---------- Footer ---------- */
  .footer-card { display: flex; gap: 24px; }
  .footer-card .fcol { flex: 1; min-width: 0; }
  .footer-card .fcol.about { flex: 1.3; }
  .footer-card h4 { margin: 0 0 10px; font-size: 12px; font-weight: 800; color: #1A2238; text-transform: uppercase; letter-spacing: 0.04em; }
  .footer-card .about p { margin: 0; font-size: 11.5px; color: #8993AC; line-height: 1.5; }
  .fcontact-row { display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: #4B5563; font-weight: 600; margin-bottom: 9px; }
  .fcontact-row:last-child { margin-bottom: 0; }
  .fcontact-row .ic { width: 13px; height: 13px; color: ${BLUE}; flex: 0 0 auto; }
  .footer-card .qrcol { flex: 0 0 100px; text-align: center; }
  .footer-card .qr { width: 64px; height: 64px; border: 1px solid #EAEDF3; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: ${BLUE}; margin: 0 auto; }
  .footer-card .qr .ic { width: 34px; height: 34px; }
  .footer-card .qrlabel { font-size: 10px; color: #9AA3B5; text-align: center; margin-top: 6px; font-weight: 600; }

  .note-bar { display: flex; align-items: flex-start; gap: 10px; background: #EAF0FF; border-radius: 12px; padding: 12px 16px; font-size: 11px; color: #3A4670; font-weight: 600; line-height: 1.4; }
  .note-bar .ic { width: 16px; height: 16px; color: ${BLUE}; flex: 0 0 auto; margin-top: 1px; }
</style>
</head>
<body>
  <div class="page">

    <div class="header">
      <div class="brandblock">
        <div class="logo">${badge("sparkles", 25)}</div>
        <div>
          <div class="brandname">PersonaVerse</div>
          <div class="tagline">Discover. Understand. Grow.</div>
        </div>
      </div>
      <div class="title">
        <h1>STUDENT POTENTIAL REPORT</h1>
        <div>Insights for Academic Growth &amp; Future Success</div>
      </div>
      <div class="right">
        <div class="datepill">${sizedIcon("calendar", 13)} ${escapeHtml(generatedDate)}</div>
        <div class="confbadge">CONFIDENTIAL REPORT</div>
      </div>
    </div>

    <div class="row">
      <div class="card profile-card">
        <div class="profile-head">
          <div class="avatar">${avatarIllustration()}</div>
          <div>
            <div class="profile-name">${escapeHtml(meta.studentName || "Student")} ${sizedIcon("star", 14)}</div>
            <div class="profile-tag">${escapeHtml(reportId)}</div>
          </div>
        </div>
        ${kvRow("userCircle", BLUE, "Student ID", studentId)}
        ${kvRow("graduationCap", PURPLE, "Roll Number", meta.rollNumber || "—")}
        ${kvRow("layers", CYAN, "Branch", meta.branch || "—")}
        ${kvRow("calendar", ORANGE, "Passing Year", meta.passingYear || "—")}
        ${kvRow("target", GREEN, "Report ID", reportId)}
        ${kvRow("checkCircle", PINK, "Questions Attempted", "48 / 48")}
      </div>

      <div class="card score-card">
        <div class="card-title" style="margin-bottom:0;">OVERALL POTENTIAL SCORE</div>
        <div class="score-ring-wrap">
          ${scoreRingSvg}
          <div class="score-ring-center"><b>${report.overallScore}</b><span>OUT OF 100</span></div>
        </div>
        <div class="band-pill">${escapeHtml(report.band)} Potential</div>
        <div class="score-desc">You demonstrate ${report.band.toLowerCase()} abilities across multiple dimensions assessed in this report.</div>
      </div>

      <div class="card highlights-card">
        <div class="card-title">${tintBadge("layers", BLUE)} Report Highlights</div>
        <div class="highlights-grid">
          <div class="hl-item">${tintBadge("shieldCheck", GREEN)}<div class="hl-text">Confidence Level<strong><span class="confidence-pill">${escapeHtml(report.confidence.level)}</span></strong></div></div>
          <div class="hl-item">${tintBadge("checkCircle", BLUE)}<div class="hl-text">Reliability Score<strong>${Math.round(report.confidence.validityScore)}%</strong></div></div>
          <div class="hl-item">${tintBadge("target", CYAN)}<div class="hl-text">Questions Answered<strong>48 / 48</strong></div></div>
          <div class="hl-item">${tintBadge("clock", PURPLE)}<div class="hl-text">Assessment Duration<strong>${escapeHtml(duration)}</strong></div></div>
          <div class="hl-item">${tintBadge("layers", ORANGE)}<div class="hl-text">Trait Coverage<strong>${traitCoveragePct}%</strong></div></div>
          <div class="hl-item">${tintBadge("flag", PINK)}<div class="hl-text">Status<strong>Completed</strong></div></div>
        </div>
        ${report.balancedProfileNote ? `<p class="balanced-note">${sizedIcon("sparkles", 13)}<span>${escapeHtml(report.balancedProfileNote)}</span></p>` : ""}
      </div>
    </div>

    <div class="row">
      <div class="card list-card col">
        <div class="card-title">${tintBadge("trophy", GREEN)} Top Strengths</div>
        <div class="card-head">
          <div class="list-illu">${mountainTrophyIllustration()}</div>
          <div class="item-list">
            ${strengths.map((t) => `<div class="item-row strength-row">${sizedIcon("checkCircle", 15)}<span class="nm">${escapeHtml(t.name)}</span><span class="score-pip">${Math.round(t.normalizedScore)}</span></div>`).join("")}
          </div>
        </div>
      </div>
      <div class="card list-card col">
        <div class="card-title">${tintBadge("trendUp", ORANGE)} Key Growth Areas</div>
        <div class="card-head">
          <div class="item-list">
            ${growth.map((t) => `<div class="item-row growth-row">${sizedIcon("flag", 15)}<span class="nm">${escapeHtml(t.name)}</span><span class="score-pip">${Math.round(t.normalizedScore)}</span></div>`).join("")}
          </div>
          <div class="list-illu">${growthFlagIllustration()}</div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="card donut-card">
        <div class="card-title">${tintBadge("userCircle", PURPLE)} Trait Profile</div>
        <div class="donut-wrap">
          ${donutSvgMarkup}
          <div class="donut-center">${tintBadge("userCircle", PURPLE, 58, 28)}</div>
        </div>
        <div class="legend">
          ${traitShares.map((s) => `<div class="legend-item"><span class="legend-dot" style="background:${s.color}"></span><span class="nm">${escapeHtml(s.name)}</span><span class="pc">${Math.round(s.share)}%</span></div>`).join("")}
        </div>
      </div>
      <div class="card potential-card col">
        <div class="card-title">${tintBadge("sparkles", PURPLE)} Potential Areas (Where You Shine)</div>
        ${careerPotential
          .map(
            (c) => `<div class="potential-row">
              ${tintBadge(c.icon, PURPLE)}
              <div class="potential-text"><div class="ptitle">${escapeHtml(c.label)}</div><div class="pdesc">${escapeHtml(c.description)}</div></div>
              ${progressBar(c.score, PURPLE, "#B98CFB")}
              <div class="potential-score">${Math.round(c.score)}%</div>
            </div>`
          )
          .join("")}
      </div>
    </div>

    <div class="card">
      <div class="card-title">${tintBadge("compass", BLUE)} Department Fit Analysis</div>
      <div class="dept-row">
        ${report.departmentFit
          .map((d) => {
            const c = getDeptColor(d.code);
            return `<div class="dept-item"><div class="icon-badge" style="background:${c}1f;color:${c};">${sizedIcon(getDeptIcon(d.code), 21)}</div><span class="pct" style="color:${c}">${Math.round(d.fitScore)}%</span><span class="nm">${escapeHtml(d.name)}</span></div>`;
          })
          .join("")}
      </div>
    </div>

    <div class="row">
      <div class="card col">
        <div class="card-title">${tintBadge("compass", CYAN)} Working Style Preferences</div>
        ${workingStyle.map((s) => kvRow(s.icon, CYAN, s.label, s.value)).join("")}
      </div>
      <div class="card col">
        <div class="card-title">${tintBadge("shieldCheck", PURPLE)} Mindset Indicators</div>
        <div class="mindset-tiles">
          ${mindset
            .map(
              (m) => `<div class="mindset-tile"><div class="icon-badge" style="background:${m.color}1f;color:${m.color};">${sizedIcon(m.icon, 22)}</div><div class="mscore">${Math.round(m.score)}%</div><div class="mlabel">${escapeHtml(m.label)}</div></div>`
            )
            .join("")}
        </div>
        <div class="mindset-callout">${sizedIcon("sparkles", 17)}<span>${escapeHtml(mindsetSummary)}</span></div>
      </div>
    </div>

    <div class="row">
      <div class="card col">
        <div class="card-title">${tintBadge("messageCircle", BLUE)} Interview Focus Areas</div>
        <ul class="plain-list">
          ${interviewFocus.map((line) => `<li>${sizedIcon("checkCircle", 13)}<span>${escapeHtml(line)}</span></li>`).join("")}
        </ul>
      </div>
      <div class="card col">
        <div class="card-title">${tintBadge("graduationCap", BLUE)} Learning Recommendations</div>
        <ul class="plain-list">
          ${learningRecs.map((r) => `<li>${sizedIcon("checkCircle", 13)}<span>${escapeHtml(r)}</span></li>`).join("")}
        </ul>
        <div class="sub-title">${tintBadge("briefcase", CYAN, 22, 12)} Career Recommendations</div>
        <ul class="plain-list">
          ${careerChips.map((c) => `<li>${sizedIcon("checkCircle", 13)}<span>${escapeHtml(c)}</span></li>`).join("")}
        </ul>
      </div>
      <div class="card col">
        <div class="card-title">${tintBadge("target", PINK)} Suggested Next Steps</div>
        <ul class="plain-list">
          ${(report.nextSteps || []).map((s) => `<li>${sizedIcon("flag", 13)}<span><strong>${escapeHtml(s.title)}:</strong> ${escapeHtml(s.content)}</span></li>`).join("")}
        </ul>
      </div>
    </div>

    <div class="reco-banner">
      <div class="reco-trophy">${finaleTrophyIllustration()}</div>
      <div class="reco-headline">
        <div class="h1">OVERALL RECOMMENDATION: ${escapeHtml(report.band).toUpperCase()} POTENTIAL</div>
        <div class="h2">${escapeHtml(report.band)} performance across the assessed traits, with a clear, well-rounded foundation for academic and professional growth.</div>
      </div>
      <div class="reco-metrics">
        <div class="reco-metric"><div class="icon-badge" style="background:${ORANGE}33;color:#FFD27A;">${sizedIcon("trophy", 16)}</div><div class="v">${report.overallScore}</div><div class="l">Overall Score</div></div>
        <div class="reco-metric"><div class="icon-badge" style="background:${CYAN}33;color:#9FE3FF;">${sizedIcon("shieldCheck", 16)}</div><div class="v">${Math.round(report.confidence.validityScore)}%</div><div class="l">Reliability</div></div>
        <div class="reco-metric"><div class="icon-badge" style="background:${PURPLE}33;color:#D2BBFF;">${sizedIcon("layers", 16)}</div><div class="v">${traitCoveragePct}%</div><div class="l">Trait Coverage</div></div>
        <div class="reco-metric"><div class="icon-badge" style="background:${GREEN}33;color:#9CEFC0;">${sizedIcon("checkCircle", 16)}</div><div class="v">${escapeHtml(report.confidence.level)}</div><div class="l">Confidence</div></div>
        <div class="reco-metric"><div class="icon-badge" style="background:${BLUE}33;color:#AFC4FF;">${sizedIcon("target", 16)}</div><div class="v">48/48</div><div class="l">Questions Answered</div></div>
      </div>
    </div>

    <div class="card footer-card">
      <div class="fcol about">
        <h4>About PersonaVerse</h4>
        <p>PersonaVerse uses psychometric science to help students discover potential, build skills and plan careers.</p>
      </div>
      <div class="fcol">
        <h4>Contact</h4>
        <div class="fcontact-row">${sizedIcon("phone", 13)}<span>+1 (555) 123-4567</span></div>
        <div class="fcontact-row">${sizedIcon("mail", 13)}<span>hello@personaverse.app</span></div>
        <div class="fcontact-row">${sizedIcon("globe", 13)}<span>www.personaverse.app</span></div>
      </div>
      <div class="fcol">
        <h4>Assessment Details</h4>
        <div class="fcontact-row">${sizedIcon("layers", 13)}<span>Tool: PersonaTrack V1</span></div>
        <div class="fcontact-row">${sizedIcon("clock", 13)}<span>Duration: ${escapeHtml(duration)}</span></div>
        <div class="fcontact-row">${sizedIcon("checkCircle", 13)}<span>Status: Completed</span></div>
      </div>
      <div class="qrcol">
        <div class="qr">${icon("qrCode")}</div>
        <div class="qrlabel">Scan to explore</div>
      </div>
    </div>

    <div class="note-bar">${sizedIcon("lightbulb", 16)}<span>This report reflects your responses to the assessment and is designed to support self-awareness and guidance conversations -- it works best alongside teacher and mentor input, not as a standalone decision.</span></div>

  </div>
</body>
</html>`;
}

module.exports = { buildExecutiveHtml };
