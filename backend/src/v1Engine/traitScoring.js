/**
 * traits: [{id, code, name, description, displayOrder}]
 * traitQuestionMap: [{traitId, groupNo}]
 * scoredAnswers: [{groupNo, score}]
 * Returns: { [traitId]: { raw, normalized, itemCount } }
 */
function computeTraitScores({ traits, traitQuestionMap, scoredAnswers }) {
  const traitIdByGroupNo = new Map(traitQuestionMap.map((row) => [row.groupNo, row.traitId]));
  const scoresByTraitId = new Map(traits.map((trait) => [trait.id, []]));

  for (const answer of scoredAnswers) {
    const traitId = traitIdByGroupNo.get(answer.groupNo);
    if (traitId !== undefined && scoresByTraitId.has(traitId)) {
      scoresByTraitId.get(traitId).push(answer.score);
    }
  }

  const result = {};
  for (const trait of traits) {
    const scores = scoresByTraitId.get(trait.id);
    const raw = scores.length ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
    const normalized = scores.length ? Math.round(((raw - 1) / 3) * 100) : 0;

    result[trait.id] = { raw, normalized, itemCount: scores.length };
  }

  return result;
}

/**
 * traitScoresById: { [traitId]: { normalized } }
 * Equal weight per trait, regardless of how many items each trait has.
 */
function computeOverallScore(traitScoresById) {
  const normalizedScores = Object.values(traitScoresById).map((t) => t.normalized);
  if (!normalizedScores.length) return 0;

  return Math.round(normalizedScores.reduce((sum, s) => sum + s, 0) / normalizedScores.length);
}

/**
 * bands: [{label, minScore, maxScore}]
 */
function getBand(overallScore, bands) {
  const match = bands.find((band) => overallScore >= band.minScore && overallScore <= band.maxScore);
  return match ? match.label : null;
}

module.exports = { computeTraitScores, computeOverallScore, getBand };
