/**
 * Pure presentation-layer derivations for the v1 executive report --
 * frontend mirror of backend/src/reports/v1Presentation.js. Duplicated
 * intentionally (no shared package between frontend/backend in this repo)
 * so the live report page and the PDF export show identical derived
 * content from the same report_json. Never recalculates a score.
 */

const CAREER_POTENTIAL_ITEMS = [
  { label: "Research Potential", traitCode: "critical_thinking_problem_solving", icon: "brain", description: "Analyzes information and solves complex problems." },
  { label: "Leadership Potential", traitCode: "leadership_initiative", icon: "users", description: "Leads, influences others and takes initiative." },
  { label: "Innovation Potential", traitCode: "entrepreneurial_innovative_thinking", icon: "lightbulb", description: "Explores new ideas and builds creative solutions." },
  { label: "Entrepreneurial Potential", traitCode: "risk_appetite", icon: "rocket", description: "Has the drive to build and execute on ideas." },
  { label: "Learning Agility", traitCode: "curiosity_learning_agility", icon: "book", description: "Learns fast, adapts quickly and stays curious." },
];

export function getCareerPotential(traits) {
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

export function getMindsetIndicators(traits) {
  const byCode = Object.fromEntries(traits.map((t) => [t.code, t]));
  return MINDSET_ITEMS.map(({ label, traitCode, icon, color }) => ({
    label,
    icon,
    color,
    score: byCode[traitCode]?.normalizedScore ?? 0,
  }));
}

export function getMindsetSummary(mindsetItems) {
  const avg = mindsetItems.reduce((sum, m) => sum + m.score, 0) / (mindsetItems.length || 1);
  if (avg >= 75) return "You have a strong, positive mindset and the inner drive to keep achieving your goals.";
  if (avg >= 55) return "You show a solid, balanced mindset with room to build even more consistency.";
  return "You're building the mindset foundations -- small, steady habits will compound quickly here.";
}

export function getInterviewFocusAreas(growthAreas) {
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

export function getLearningRecommendations(growthAreas) {
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

export function getDeptIcon(code) {
  return DEPT_ICON_BY_CODE[code] || "target";
}

const DEPT_COLOR_BY_CODE = {
  technology_engineering: "#0F3DDE",
  data_analytics: "#27AE60",
  business_management: "#7B3FE4",
  marketing_communication: "#FF8A00",
  finance_operations: "#2CB7F5",
  design_innovation: "#F64C72",
  hr_people: "#081C5A",
};

export function getDeptColor(code) {
  return DEPT_COLOR_BY_CODE[code] || "#0F3DDE";
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

export function formatStudentId(resultId) {
  return resultId ? `STU-${String(resultId).slice(0, 6).toUpperCase()}` : "—";
}
