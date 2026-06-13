const answerRepository = require("../repositories/answerRepository");
const traitRepository = require("../repositories/traitRepository");
const dimensionRepository = require("../repositories/dimensionRepository");
const personalityTypeRepository = require("../repositories/personalityTypeRepository");
const recommendationRepository = require("../repositories/recommendationRepository");
const formulaRepository = require("../repositories/formulaRepository");

const { computeTraitScores } = require("../calculations/traitScores");
const { computeDimensionScores } = require("../calculations/dimensionScores");
const { computeConfidence } = require("../calculations/confidence");
const { matchPersonalityType } = require("./personalityMatcher");
const { matchRecommendations, buildRecommendationSections } = require("./recommendationMatcher");

function groupWeightsByDimensionId(weights) {
  const weightsByDimensionId = {};
  for (const { dimensionId, traitCode, weight } of weights) {
    if (!weightsByDimensionId[dimensionId]) weightsByDimensionId[dimensionId] = [];
    weightsByDimensionId[dimensionId].push({ traitCode, weight });
  }
  return weightsByDimensionId;
}

function buildScoreLists(traits, dimensions, traitScores, dimensionScores) {
  const traitScoreList = traits.map((trait) => ({
    code: trait.code,
    name: trait.name,
    score: traitScores[trait.code],
  }));

  const dimensionScoreList = {};
  for (const dimension of dimensions) {
    if (!dimensionScoreList[dimension.framework]) dimensionScoreList[dimension.framework] = [];
    dimensionScoreList[dimension.framework].push({
      code: dimension.code,
      name: dimension.name,
      score: dimensionScores[dimension.framework][dimension.code],
    });
  }

  return { traits: traitScoreList, dimensions: dimensionScoreList };
}

/**
 * Orchestrates the full scoring pipeline for a completed session and returns
 * the report shape persisted to assessment_results.report_json.
 */
async function buildReport(sessionId) {
  const [
    answeredOptions,
    traits,
    dimensions,
    weights,
    personalityTypes,
    recommendations,
    traitScoreFormula,
    dimensionScoreFormula,
    confidenceFormula,
  ] = await Promise.all([
    answerRepository.getScoredAnswersForSession(sessionId),
    traitRepository.getActiveTraits(),
    dimensionRepository.getAllDimensions(),
    dimensionRepository.getTraitDimensionWeights(),
    personalityTypeRepository.getActiveTypes(),
    recommendationRepository.getActiveRecommendations(),
    formulaRepository.getCurrentDefinition("trait_score"),
    formulaRepository.getCurrentDefinition("dimension_score"),
    formulaRepository.getCurrentDefinition("confidence_score"),
  ]);

  const traitScores = computeTraitScores({ traits, answeredOptions, formulaDefinition: traitScoreFormula });

  const dimensionScores = computeDimensionScores({
    dimensions,
    traitScores,
    weightsByDimensionId: groupWeightsByDimensionId(weights),
    formulaDefinition: dimensionScoreFormula,
  });

  const confidence = computeConfidence({ traitScores, formulaDefinition: confidenceFormula });

  const personalityType = matchPersonalityType(personalityTypes, dimensionScores);

  const matched = matchRecommendations(recommendations, { traitScores, dimensionScores, personalityType });
  const sections = buildRecommendationSections(matched);

  return {
    personalityType: {
      code: personalityType.code,
      name: personalityType.name,
      description: personalityType.description,
    },
    scores: buildScoreLists(traits, dimensions, traitScores, dimensionScores),
    confidence,
    ...sections,
  };
}

module.exports = { buildReport };
