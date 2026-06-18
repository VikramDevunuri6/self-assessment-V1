const BALANCED_LABEL = "Balanced Across Multiple Areas";
const BALANCED_RATIONALE =
  "No single trait stands out strongly enough yet to point to one specific career direction -- as you gain more experience, distinct strengths are likely to emerge.";
const BALANCED_PROFILE_NOTE =
  "Your profile is balanced across multiple strengths rather than dominated by a single trait.";

function matchesCondition(condition, traitScoresByCode, config) {
  const score = traitScoresByCode[condition.traitCode]?.normalized ?? 0;

  if (condition.operator === "high") return score >= config.highThreshold;
  if (condition.operator === "low") return score <= config.lowThreshold;

  return false;
}

/**
 * rules: [{label, rationale, conditions: [{traitCode, operator}]}]
 * traitScoresByCode: { [traitCode]: { normalized } }
 * config: { highThreshold, lowThreshold, balancedSpreadThreshold }
 * Returns: { signals: [{label, rationale}], balancedProfileNote: string|null }
 */
function evaluateCareerSignals({ rules, traitScoresByCode, config }) {
  const matched = rules.filter((rule) => rule.conditions.every((c) => matchesCondition(c, traitScoresByCode, config)));

  const normalizedScores = Object.values(traitScoresByCode).map((t) => t.normalized);
  const spread = normalizedScores.length ? Math.max(...normalizedScores) - Math.min(...normalizedScores) : 0;
  const tightlyClustered = spread <= config.balancedSpreadThreshold;

  const signals = matched.length
    ? matched.map((rule) => ({ label: rule.label, rationale: rule.rationale }))
    : [{ label: BALANCED_LABEL, rationale: BALANCED_RATIONALE }];

  return {
    signals,
    balancedProfileNote: tightlyClustered ? BALANCED_PROFILE_NOTE : null,
  };
}

module.exports = { evaluateCareerSignals };
