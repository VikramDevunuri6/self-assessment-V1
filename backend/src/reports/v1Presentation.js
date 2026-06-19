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
  { label: "Research Potential", traitCode: "critical_thinking_problem_solving", icon: "brain", description: "Analyzes information and solves complex problems." },
  { label: "Leadership Potential", traitCode: "leadership_initiative", icon: "users", description: "Leads, influences others and takes initiative." },
  { label: "Innovation Potential", traitCode: "entrepreneurial_innovative_thinking", icon: "lightbulb", description: "Explores new ideas and builds creative solutions." },
  { label: "Entrepreneurial Potential", traitCode: "risk_appetite", icon: "rocket", description: "Has the drive to build and execute on ideas." },
  { label: "Learning Agility", traitCode: "curiosity_learning_agility", icon: "book", description: "Learns fast, adapts quickly and stays curious." },
];

function getCareerPotential(traits) {
  const byCode = Object.fromEntries(traits.map((t) => [t.code, t]));
  return CAREER_POTENTIAL_ITEMS.map(({ label, traitCode, icon, description }) => ({
    label,
    icon,
    description,
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

  return [
    { label: "Collaboration Style", value: collaborationStyle, icon: "users" },
    { label: "Decision Style", value: decisionStyle, icon: "compass" },
    { label: "Learning Style", value: learningStyle, icon: "book" },
    { label: "Planning Style", value: planningStyle, icon: "calendar" },
  ];
}

const MINDSET_ITEMS = [
  { label: "Growth Mindset", traitCode: "growth_mindset", icon: "sparkles", color: "#27AE60" },
  { label: "Resilience", traitCode: "resilience_emotional_stability", icon: "shieldCheck", color: "#7B3FE4" },
  { label: "Motivation", traitCode: "career_values_achievement_motivation", icon: "trendUp", color: "#FF8A00" },
  { label: "Integrity", traitCode: "integrity_accountability", icon: "checkCircle", color: "#2CB7F5" },
];

/**
 * "Mindset Indicators" is a direct relabel of 4 of the 13 already-scored
 * traits (same pattern as Career Potential above) -- not a new instrument.
 */
function getMindsetIndicators(traits) {
  const byCode = Object.fromEntries(traits.map((t) => [t.code, t]));
  return MINDSET_ITEMS.map(({ label, traitCode, icon, color }) => ({
    label,
    icon,
    color,
    score: byCode[traitCode]?.normalizedScore ?? 0,
  }));
}

/**
 * One-line takeaway under the Mindset Indicators row, banded off the
 * average of the same 4 scores shown above it -- same pattern as the
 * existing band/score description text, not a new metric.
 */
function getMindsetSummary(mindsetItems) {
  const avg = mindsetItems.reduce((sum, m) => sum + m.score, 0) / (mindsetItems.length || 1);
  if (avg >= 75) return "You have a strong, positive mindset and the inner drive to keep achieving your goals.";
  if (avg >= 55) return "You show a solid, balanced mindset with room to build even more consistency.";
  return "You're building the mindset foundations -- small, steady habits will compound quickly here.";
}

/**
 * Reframes the engine's own growthAreas (already computed, each with a
 * .tip) as interview-prep bullets. No new data -- same 3 items used for
 * nextSteps, presented with interview-specific framing text.
 */
function getInterviewFocusAreas(growthAreas) {
  return (growthAreas || [])
    .filter((area) => area.tip)
    .map((area) => `Be ready to speak about your approach to ${area.name.toLowerCase()} -- ${area.tip}`);
}

const LEARNING_RECS_BY_TRAIT_CODE = {
  communication_social_confidence: ["Public Speaking & Presentation Skills", "Business Communication"],
  empathy_interpersonal_sensitivity: ["Active Listening & Empathy", "Interpersonal Communication"],
  discipline_time_management: ["Time Management & Productivity", "Goal-Setting Frameworks"],
  leadership_initiative: ["Leadership Fundamentals", "Team Management"],
  resilience_emotional_stability: ["Stress Management", "Emotional Intelligence at Work"],
  curiosity_learning_agility: ["Learning How to Learn", "Self-Directed Research Skills"],
  growth_mindset: ["Growth Mindset & Resilience", "Feedback & Continuous Improvement"],
  integrity_accountability: ["Workplace Ethics & Accountability", "Professional Responsibility"],
  adaptability_change_readiness: ["Change Management Basics", "Agile Ways of Working"],
  critical_thinking_problem_solving: ["Advanced Problem Solving", "Data-Driven Decision Making"],
  entrepreneurial_innovative_thinking: ["Design Thinking", "Innovation & Ideation"],
  risk_appetite: ["Risk Assessment Fundamentals", "Strategic Decision Making"],
  career_values_achievement_motivation: ["Career Planning & Goal Alignment", "Personal Branding"],
};

/**
 * Static lookup keyed by the engine's own growth-area trait codes (same
 * pattern as the Career Recommendation chips) -- picks 2 courses per
 * lowest-scoring trait rather than inventing a separate recommendation
 * model.
 */
function getLearningRecommendations(growthAreas) {
  const recs = [];
  for (const area of growthAreas || []) {
    const titles = LEARNING_RECS_BY_TRAIT_CODE[area.code] || [];
    for (const title of titles) {
      if (!recs.includes(title)) recs.push(title);
    }
  }
  return recs.slice(0, 5);
}

const DEPT_ICON_BY_CODE = {
  technology_engineering: "code",
  data_analytics: "barChart",
  business_management: "briefcase",
  marketing_communication: "messageCircle",
  finance_operations: "trendUp",
  design_innovation: "lightbulb",
  hr_people: "users",
};

function getDeptIcon(code) {
  return DEPT_ICON_BY_CODE[code] || "target";
}

/**
 * Maps each of the 7 fixed department codes to one of the brand's 7
 * accent colors, keyed by code (not array position) so the mapping stays
 * correct regardless of what order the engine returns departmentFit in
 * (e.g. sorted by fitScore).
 */
const DEPT_COLOR_BY_CODE = {
  technology_engineering: "#0F3DDE",
  data_analytics: "#27AE60",
  business_management: "#7B3FE4",
  marketing_communication: "#FF8A00",
  finance_operations: "#2CB7F5",
  design_innovation: "#F64C72",
  hr_people: "#081C5A",
};

function getDeptColor(code) {
  return DEPT_COLOR_BY_CODE[code] || "#0F3DDE";
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

function formatStudentId(resultId) {
  return resultId ? `STU-${String(resultId).slice(0, 6).toUpperCase()}` : "—";
}

module.exports = {
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
};
