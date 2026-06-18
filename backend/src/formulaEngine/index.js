const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

const averageNormalized = require("./types/averageNormalized");
const weightedAverageWithInversion = require("./types/weightedAverageWithInversion");
const varianceBased = require("./types/varianceBased");

const HANDLERS = {
  average_normalized: averageNormalized,
  weighted_average_with_inversion: weightedAverageWithInversion,
  variance_based: varianceBased,
};

function evaluate(definition, input) {
  const handler = HANDLERS[definition?.type];

  if (!handler) {
    throw new AppError(500, `Unknown formula type: ${definition?.type}`, ERROR_CODES.INTERNAL_ERROR);
  }

  return handler(definition, input);
}

module.exports = { evaluate, SUPPORTED_TYPES: Object.keys(HANDLERS) };
