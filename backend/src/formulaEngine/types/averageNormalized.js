const { clamp, round } = require("../utils");

/**
 * definition: { type: "average_normalized", scale: { min, max } }
 * input: { values: number[] }
 */
function averageNormalized(definition, { values }) {
  const { min, max } = definition.scale || { min: 0, max: 100 };

  if (!values || values.length === 0) {
    return min;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  return clamp(round(average), min, max);
}

module.exports = averageNormalized;
