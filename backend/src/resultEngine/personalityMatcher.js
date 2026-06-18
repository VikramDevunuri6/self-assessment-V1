/**
 * criteria: { all: [{ framework, dimension, min?, max? }] }
 * dimensionScores: { [framework]: { [dimensionCode]: number } }
 */
function matchesCriteria(criteria, dimensionScores) {
  const rules = criteria?.all || [];

  return rules.every((rule) => {
    const value = dimensionScores[rule.framework]?.[rule.dimension];
    if (value === undefined) return false;
    if (rule.min !== undefined && value < rule.min) return false;
    if (rule.max !== undefined && value > rule.max) return false;
    return true;
  });
}

/**
 * personalityTypes: [{ id, code, name, description, criteria, priority }] ordered by priority ascending.
 * Returns the first matching type, falling back to the last (lowest-priority, typically
 * the catch-all with an empty `criteria.all`).
 */
function matchPersonalityType(personalityTypes, dimensionScores) {
  for (const type of personalityTypes) {
    if (matchesCriteria(type.criteria, dimensionScores)) {
      return type;
    }
  }

  return personalityTypes[personalityTypes.length - 1];
}

module.exports = { matchPersonalityType, matchesCriteria };
