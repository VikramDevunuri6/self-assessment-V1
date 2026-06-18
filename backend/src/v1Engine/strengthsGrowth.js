const STRENGTHS_COUNT = 3;
const GROWTH_COUNT = 3;

/**
 * traits: [{id, code, name}]
 * traitScoresById: { [traitId]: { normalized } }
 * traitTipsById: { [traitId]: tipText }
 * Returns: { strengths: [{code,name,score}], growthAreas: [{code,name,score,tip}] }
 * Always derived live from the actual scores -- never a fixed list.
 */
function deriveStrengthsAndGrowth({ traits, traitScoresById, traitTipsById }) {
  const ranked = traits
    .map((trait) => ({ code: trait.code, name: trait.name, score: traitScoresById[trait.id]?.normalized ?? 0, id: trait.id }))
    .sort((a, b) => b.score - a.score);

  const strengths = ranked.slice(0, STRENGTHS_COUNT).map(({ code, name, score }) => ({ code, name, score }));

  const growthAreas = ranked
    .slice(-GROWTH_COUNT)
    .reverse()
    .map(({ id, code, name, score }) => ({ code, name, score, tip: traitTipsById[id] ?? null }));

  return { strengths, growthAreas };
}

module.exports = { deriveStrengthsAndGrowth };
