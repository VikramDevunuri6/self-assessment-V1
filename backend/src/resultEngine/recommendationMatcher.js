const SECTION_BY_TYPE = {
  strength: "strengths",
  weakness: "weaknesses",
  career: "careerSuggestions",
  learning: "learningRecommendations",
  interview_focus: "interviewFocusAreas",
};

/**
 * rec: { personality_type_id, condition, ... }
 * condition shapes:
 *  - {} when personality_type_id is set -> matches the resolved personality type
 *  - { trait, min?, max? } -> matches traitScores[trait]
 *  - { framework, dimension, min?, max? } -> matches dimensionScores[framework][dimension]
 */
function matchesCondition(rec, { traitScores, dimensionScores, personalityType }) {
  if (rec.personality_type_id !== null && rec.personality_type_id !== undefined) {
    return personalityType?.id === rec.personality_type_id;
  }

  const condition = rec.condition || {};

  let value;
  if (condition.trait !== undefined) {
    value = traitScores[condition.trait];
  } else if (condition.framework !== undefined) {
    value = dimensionScores[condition.framework]?.[condition.dimension];
  } else {
    return false;
  }

  if (value === undefined) return false;
  if (condition.min !== undefined && value < condition.min) return false;
  if (condition.max !== undefined && value > condition.max) return false;
  return true;
}

function matchRecommendations(recommendations, context) {
  return recommendations.filter((rec) => matchesCondition(rec, context));
}

/**
 * matched: [{ type, title, content }] ordered by priority (descending)
 * Returns the recommendation sections plus a flat `recommendations` list.
 */
function buildRecommendationSections(matched) {
  const sections = {
    strengths: [],
    weaknesses: [],
    careerSuggestions: [],
    learningRecommendations: [],
    interviewFocusAreas: [],
  };

  const recommendations = [];

  for (const rec of matched) {
    const entry = { title: rec.title, content: rec.content };
    recommendations.push({ type: rec.type, ...entry });

    const sectionKey = SECTION_BY_TYPE[rec.type];
    if (sectionKey) {
      sections[sectionKey].push(entry);
    }
  }

  return { ...sections, recommendations };
}

module.exports = { matchesCondition, matchRecommendations, buildRecommendationSections };
