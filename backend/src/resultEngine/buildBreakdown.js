const answerRepository = require("../repositories/answerRepository");
const traitRepository = require("../repositories/traitRepository");
const dimensionRepository = require("../repositories/dimensionRepository");
const personalityTypeRepository = require("../repositories/personalityTypeRepository");
const formulaRepository = require("../repositories/formulaRepository");

const { computeTraitScores } = require("../calculations/traitScores");
const { computeDimensionScores } = require("../calculations/dimensionScores");
const { computeConfidence } = require("../calculations/confidence");
const { matchesCriteria } = require("./personalityMatcher");

function groupWeightsByDimensionId(weights) {
  const weightsByDimensionId = {};
  for (const { dimensionId, traitCode, weight } of weights) {
    if (!weightsByDimensionId[dimensionId]) weightsByDimensionId[dimensionId] = [];
    weightsByDimensionId[dimensionId].push({ traitCode, weight });
  }
  return weightsByDimensionId;
}

/**
 * Re-runs the scoring pipeline for a session and returns the intermediate
 * values at each step (trait scores, dimension scores, confidence and
 * personality-type matching), for the admin "Score Breakdown" and
 * "Profile Generation Details" views. Works for in-progress sessions too,
 * since it is computed live from the current `answers` rows.
 */
async function buildBreakdown(sessionId) {
  const [scoredAnswers, traits, dimensions, weights, personalityTypes, traitScoreFormula, dimensionScoreFormula, confidenceFormula] =
    await Promise.all([
      answerRepository.getScoredAnswersForSession(sessionId),
      traitRepository.getActiveTraits(),
      dimensionRepository.getAllDimensions(),
      dimensionRepository.getTraitDimensionWeights(),
      personalityTypeRepository.getActiveTypes(),
      formulaRepository.getCurrentDefinition("trait_score"),
      formulaRepository.getCurrentDefinition("dimension_score"),
      formulaRepository.getCurrentDefinition("confidence_score"),
    ]);

  const traitScores = computeTraitScores({ traits, answeredOptions: scoredAnswers, formulaDefinition: traitScoreFormula });

  const answersByTraitId = new Map();
  for (const { questionId, traitId, score } of scoredAnswers) {
    if (!answersByTraitId.has(traitId)) answersByTraitId.set(traitId, []);
    answersByTraitId.get(traitId).push({ questionId, score });
  }

  const traitBreakdown = traits.map((trait) => ({
    code: trait.code,
    name: trait.name,
    score: traitScores[trait.code],
    answers: answersByTraitId.get(trait.id) || [],
    formula: traitScoreFormula,
  }));

  const weightsByDimensionId = groupWeightsByDimensionId(weights);
  const dimensionScores = computeDimensionScores({
    dimensions,
    traitScores,
    weightsByDimensionId,
    formulaDefinition: dimensionScoreFormula,
  });

  const dimensionBreakdown = {};
  for (const dimension of dimensions) {
    if (!dimensionBreakdown[dimension.framework]) dimensionBreakdown[dimension.framework] = [];

    const dimensionWeights = (weightsByDimensionId[dimension.id] || []).map(({ traitCode, weight }) => ({
      traitCode,
      traitName: traits.find((trait) => trait.code === traitCode)?.name ?? traitCode,
      weight,
      traitScore: traitScores[traitCode],
    }));

    dimensionBreakdown[dimension.framework].push({
      code: dimension.code,
      name: dimension.name,
      score: dimensionScores[dimension.framework][dimension.code],
      weights: dimensionWeights,
      formula: dimensionScoreFormula,
    });
  }

  const confidence = computeConfidence({ traitScores, formulaDefinition: confidenceFormula });

  const evaluationOrder = personalityTypes.map((type) => ({
    code: type.code,
    name: type.name,
    priority: type.priority,
    criteria: type.criteria,
    matched: matchesCriteria(type.criteria, dimensionScores),
  }));

  const matchedType = evaluationOrder.find((type) => type.matched) || evaluationOrder[evaluationOrder.length - 1] || null;

  return {
    traitScores: traitBreakdown,
    dimensionScores: dimensionBreakdown,
    confidence: {
      traitScores,
      formula: confidenceFormula,
      value: confidence,
    },
    personalityMatch: {
      matchedCode: matchedType?.code ?? null,
      evaluationOrder,
    },
  };
}

module.exports = { buildBreakdown };
