const { clamp, round } = require("../utils");

/**
 * definition: { type: "weighted_average_with_inversion", scale: { min, max } }
 * input: {
 *   traitScores: { [traitCode]: number },
 *   weights: [{ traitCode, weight }]  // weight may be negative => inverse relationship
 * }
 *
 * For each weight row, a negative weight uses (max - traitScore + min) instead of
 * traitScore directly, then weights are combined using absolute values.
 */
function weightedAverageWithInversion(definition, { traitScores, weights }) {
  const { min, max } = definition.scale || { min: 0, max: 100 };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const { traitCode, weight } of weights || []) {
    const traitScore = traitScores[traitCode];
    if (traitScore === undefined) continue;

    const value = weight >= 0 ? traitScore : max - traitScore + min;

    weightedSum += value * Math.abs(weight);
    totalWeight += Math.abs(weight);
  }

  if (totalWeight === 0) {
    return min;
  }

  return clamp(round(weightedSum / totalWeight), min, max);
}

module.exports = weightedAverageWithInversion;
