/**
 * Pure presentation-layer derivations for the v1 executive report --
 * frontend mirror of backend/src/reports/v1Presentation.js. Duplicated
 * intentionally (no shared package between frontend/backend in this repo)
 * so the live report page and the PDF export show identical derived
 * content from the same report_json. Never recalculates a score.
 */

const CAREER_POTENTIAL_ITEMS = [
  { label: "Research Potential", traitCode: "critical_thinking_problem_solving" },
  { label: "Leadership Potential", traitCode: "leadership_initiative" },
  { label: "Innovation Potential", traitCode: "entrepreneurial_innovative_thinking" },
  { label: "Entrepreneurial Potential", traitCode: "risk_appetite" },
  { label: "Learning Agility", traitCode: "curiosity_learning_agility" },
];

export function getCareerPotential(traits) {
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

export function getCareerChips(careerSignals) {
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

export function deriveWorkingStyle(traits) {
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

export function topNTraits(traits, n) {
  return [...traits].sort((a, b) => b.normalizedScore - a.normalizedScore).slice(0, n);
}

export function bottomNTraits(traits, n) {
  return [...traits].sort((a, b) => a.normalizedScore - b.normalizedScore).slice(0, n);
}

export function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return "—";
  const minutes = Math.max(1, Math.round((new Date(completedAt) - new Date(startedAt)) / 60000));
  return `${minutes} min`;
}

export function formatReportId(resultId) {
  return resultId ? `RPT-${String(resultId).slice(0, 8).toUpperCase()}` : "—";
}

export const SHORT_TRAIT_NAMES = {
  communication_social_confidence: "Communication",
  empathy_interpersonal_sensitivity: "Empathy",
  discipline_time_management: "Discipline",
  leadership_initiative: "Leadership",
  resilience_emotional_stability: "Resilience",
  curiosity_learning_agility: "Curiosity",
  growth_mindset: "Growth Mindset",
  integrity_accountability: "Integrity",
  adaptability_change_readiness: "Adaptability",
  critical_thinking_problem_solving: "Critical Thinking",
  entrepreneurial_innovative_thinking: "Innovation",
  risk_appetite: "Risk Appetite",
  career_values_achievement_motivation: "Achievement",
};
