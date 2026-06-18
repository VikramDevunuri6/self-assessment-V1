const formulaEngine = require("../formulaEngine");

/**
 * dimensions: [{ id, framework, code, name }]
 * traitScores: { [traitCode]: number }
 * weightsByDimensionId: { [dimensionId]: [{ traitCode, weight }] }
 * Returns: { [framework]: { [dimensionCode]: number } }
 */
function computeDimensionScores({ dimensions, traitScores, weightsByDimensionId, formulaDefinition }) {
  const dimensionScores = {};

  for (const dimension of dimensions) {
    if (!dimensionScores[dimension.framework]) {
      dimensionScores[dimension.framework] = {};
    }

    dimensionScores[dimension.framework][dimension.code] = formulaEngine.evaluate(formulaDefinition, {
      traitScores,
      weights: weightsByDimensionId[dimension.id] || [],
    });
  }

  return dimensionScores;
}

module.exports = { computeDimensionScores };
