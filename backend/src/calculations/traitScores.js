const formulaEngine = require("../formulaEngine");

/**
 * traits: [{ id, code, name, description }]
 * answeredOptions: [{ traitId, score }]
 * Returns: { [traitCode]: number }
 */
function computeTraitScores({ traits, answeredOptions, formulaDefinition }) {
  const valuesByTraitId = new Map(traits.map((trait) => [trait.id, []]));

  for (const { traitId, score } of answeredOptions) {
    if (valuesByTraitId.has(traitId)) {
      valuesByTraitId.get(traitId).push(score);
    }
  }

  const traitScores = {};
  for (const trait of traits) {
    traitScores[trait.code] = formulaEngine.evaluate(formulaDefinition, {
      values: valuesByTraitId.get(trait.id),
    });
  }

  return traitScores;
}

module.exports = { computeTraitScores };
