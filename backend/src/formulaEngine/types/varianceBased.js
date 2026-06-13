const { clamp, round } = require("../utils");

/**
 * definition: { type: "variance_based", base, factor, scale: { min, max } }
 * input: { values: number[] }
 *
 * confidence = clamp(base + stdev(values) * factor, min, max)
 * A more differentiated trait profile (higher spread) yields higher confidence
 * in the matched personality archetype.
 */
function varianceBased(definition, { values }) {
  const { min, max } = definition.scale || { min: 0, max: 100 };
  const base = definition.base ?? 50;
  const factor = definition.factor ?? 1;

  if (!values || values.length === 0) {
    return clamp(round(base), min, max);
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const stdev = Math.sqrt(variance);

  return clamp(round(base + stdev * factor), min, max);
}

module.exports = varianceBased;
