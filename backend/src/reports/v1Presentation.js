/**
 * Pure presentation-layer derivations for the v1 executive report.
 * Everything here reads already-computed report_json values (trait scores,
 * career signal labels) and reshapes/relabels them for display -- it never
 * recalculates a score, never touches the database, never imports
 * v1Engine/v1Repositories. Mirrored (intentionally duplicated, no shared
 * package in this repo) by frontend/src/lib/v1ReportPresentation.js so the
 * web page and PDF show identical derived content.
 */

const CAREER_POTENTIAL_ITEMS = [
  { label: "Research Potential", traitCode: "critical_thinking_problem_solving" },
  { label: "Leadership Potential", traitCode: "leadership_initiative" },
  { label: "Innovation Potential", traitCode: "entrepreneurial_innovative_thinking" },
  { label: "Entrepreneurial Potential", traitCode: "risk_appetite" },
  { label: "Learning Agility", traitCode: "curiosity_learning_agility" },
];

function getCareerPotential(traits) {
  const byCode = Object.fromEntries(traits.map((t) => [t.code, t]));
  return CAREER_POTENTIAL_ITEMS.map(({ label, traitCode }) => ({
    label,
    score: byCode[traitCode]?.normalizedScore ?? 0,
  }));
}

const CAREER_CHIPS_BY_LABEL = {
  "Research & Analytical Careers": ["Data Analyst", "Research Analyst"],
  "People & Leadership Careers": ["Product Manager", "Team Lead"],
  "Builder / Founder Track": ["Entrepreneur", "Founder"],
  "People-Support Careers": ["HR Associate", "Counselor"],
  "Structured / Operational Careers": ["Operations Analyst", "Compliance Analyst"],
  "Fast-Change Environments": ["Startup Generalist", "Growth Associate"],
  "Innovation / Product Roles": ["Product Designer", "Innovation Associate"],
  "Stability-Oriented Roles": ["Process Analyst", "Quality Analyst"],
  "Balanced Across Multiple Areas": ["Generalist Track", "Cross-Functional Roles"],
};

function getCareerChips(careerSignals) {
  const chips = [];
  for (const signal of careerSignals) {
    const titles = CAREER_CHIPS_BY_LABEL[signal.label] || [signal.label];
    for (const title of titles) {
      if (!chips.includes(title)) chips.push(title);
    }
  }
  return chips.slice(0, 6);
}

function scoreOf(byCode, code) {
  return byCode[code]?.normalizedScore ?? 0;
}

function deriveWorkingStyle(traits) {
  const byCode = Object.fromEntries(traits.map((t) => [t.code, t]));

  const decisionStyle =
    scoreOf(byCode, "critical_thinking_problem_solving") >= scoreOf(byCode, "risk_appetite")
      ? "Logical & Analytical"
      : "Intuitive & Fast";

  const learningStyle =
    scoreOf(byCode, "curiosity_learning_agility") >= scoreOf(byCode, "growth_mindset")
      ? "Exploratory & Research-Oriented"
      : "Structured & Guided";

  const collaborationStyle =
    Math.abs(scoreOf(byCode, "leadership_initiative") - scoreOf(byCode, "empathy_interpersonal_sensitivity")) <= 10
      ? "Balanced Collaborator"
      : scoreOf(byCode, "leadership_initiative") > scoreOf(byCode, "empathy_interpersonal_sensitivity")
        ? "Leads Naturally"
        : "Supportive Team Player";

  const planningStyle =
    scoreOf(byCode, "discipline_time_management") >= 60 ? "Structured & Goal-Focused" : "Flexible & Adaptive";

  return {
    "Decision Style": decisionStyle,
    "Learning Style": learningStyle,
    "Collaboration Style": collaborationStyle,
    "Planning Style": planningStyle,
  };
}

function topNTraits(traits, n) {
  return [...traits].sort((a, b) => b.normalizedScore - a.normalizedScore).slice(0, n);
}

function bottomNTraits(traits, n) {
  return [...traits].sort((a, b) => a.normalizedScore - b.normalizedScore).slice(0, n);
}

function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return "—";
  const minutes = Math.max(1, Math.round((new Date(completedAt) - new Date(startedAt)) / 60000));
  return `${minutes} min`;
}

function formatReportId(resultId) {
  return resultId ? `RPT-${String(resultId).slice(0, 8).toUpperCase()}` : "—";
}

module.exports = {
  getCareerPotential,
  getCareerChips,
  deriveWorkingStyle,
  topNTraits,
  bottomNTraits,
  formatDuration,
  formatReportId,
};
