const formulaEngine = require("../formulaEngine");

/**
 * traitScores: { [traitCode]: number }
 * Returns: number (0-100)
 */
function computeConfidence({ traitScores, formulaDefinition }) {
  return formulaEngine.evaluate(formulaDefinition, { values: Object.values(traitScores) });
}

module.exports = { computeConfidence };
