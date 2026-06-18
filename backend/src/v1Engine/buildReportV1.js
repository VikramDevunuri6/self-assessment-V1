const v1TraitRepository = require("../v1Repositories/v1TraitRepository");
const v1DepartmentRepository = require("../v1Repositories/v1DepartmentRepository");
const v1CareerSignalRepository = require("../v1Repositories/v1CareerSignalRepository");
const v1ConfigRepository = require("../v1Repositories/v1ConfigRepository");
const v1AnswerRepository = require("../v1Repositories/v1AnswerRepository");

const { computeTraitScores, computeOverallScore, getBand } = require("./traitScoring");
const { computeDepartmentScores } = require("./departmentFit");
const { evaluateCareerSignals } = require("./careerSignals");
const { computeValidityScore, detectStraightLining, detectTooFast, computeConfidence } = require("./confidence");
const { deriveStrengthsAndGrowth } = require("./strengthsGrowth");
const { validateAnswersForScoring } = require("./validateAnswers");

/**
 * Orchestrates the full v1 scoring pipeline for a completed session and
 * returns both the report_json shape and the flattened rows the repository
 * needs to persist (trait scores, department scores, top-level summary).
 */
async function buildReportV1(sessionId, startedAt) {
  const [
    traits,
    traitQuestionMap,
    validityGroupNos,
    departments,
    departmentWeights,
    careerRules,
    scoreBands,
    engineConfig,
    traitTipsById,
    scoredAnswers,
  ] = await Promise.all([
    v1TraitRepository.getActiveTraits(),
    v1TraitRepository.getTraitQuestionMap(),
    v1TraitRepository.getValidityGroupNos(),
    v1DepartmentRepository.getActiveDepartments(),
    v1DepartmentRepository.getDepartmentTraitWeights(),
    v1CareerSignalRepository.getActiveRules(),
    v1ConfigRepository.getScoreBands(),
    v1ConfigRepository.getEngineConfig(),
    v1ConfigRepository.getTraitTips(),
    v1AnswerRepository.getScoredAnswersForSession(sessionId),
  ]);

  validateAnswersForScoring({ scoredAnswers, traitQuestionMap, validityGroupNos });

  const traitScoresById = computeTraitScores({ traits, traitQuestionMap, scoredAnswers });

  const traitScoresByCode = {};
  for (const trait of traits) traitScoresByCode[trait.code] = traitScoresById[trait.id];

  const overallScore = computeOverallScore(traitScoresById);
  const band = getBand(overallScore, scoreBands);

  const departmentScores = computeDepartmentScores({ departments, departmentWeights, traitScoresByCode });
  const sortedDepartmentScores = [...departmentScores].sort((a, b) => b.fitScore - a.fitScore);

  const { signals: careerSignals, balancedProfileNote } = evaluateCareerSignals({
    rules: careerRules,
    traitScoresByCode,
    config: engineConfig,
  });

  const validityScore = computeValidityScore(scoredAnswers, validityGroupNos);
  const straightLiningFlag = detectStraightLining(scoredAnswers);
  const tooFastFlag = detectTooFast(startedAt);
  const confidence = computeConfidence({ validityScore, straightLiningFlag, tooFastFlag });

  const { strengths, growthAreas } = deriveStrengthsAndGrowth({ traits, traitScoresById, traitTipsById });

  const nextSteps = growthAreas
    .filter((area) => area.tip)
    .map((area) => ({ title: area.name, content: area.tip }));

  const reportJson = {
    engineVersion: "v1",
    overallScore,
    band,
    traits: traits.map((trait) => ({
      code: trait.code,
      name: trait.name,
      rawScore: traitScoresById[trait.id].raw,
      normalizedScore: traitScoresById[trait.id].normalized,
      displayOrder: trait.displayOrder,
    })),
    strengths,
    growthAreas,
    departmentFit: sortedDepartmentScores.map((d) => ({ code: d.code, name: d.name, fitScore: d.fitScore })),
    careerSignals,
    balancedProfileNote,
    confidence,
    nextSteps,
  };

  return {
    reportJson,
    persistable: {
      traitScoreRows: traits.map((trait) => ({
        traitId: trait.id,
        rawScore: traitScoresById[trait.id].raw,
        normalizedScore: traitScoresById[trait.id].normalized,
        itemCount: traitScoresById[trait.id].itemCount,
      })),
      departmentScoreRows: departmentScores.map((d) => ({ departmentId: d.departmentId, fitScore: d.fitScore })),
      summary: {
        overallScore,
        band,
        confidenceLevel: confidence.level,
        validityScore,
        straightLiningFlag,
        tooFastFlag,
      },
    },
  };
}

module.exports = { buildReportV1 };
