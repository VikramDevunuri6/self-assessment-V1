const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

const WEIGHT_SUM_TOLERANCE = 0.01;

/**
 * departments: [{id, code, name, displayOrder}]
 * departmentWeights: [{departmentId, traitCode, weight}]
 * traitScoresByCode: { [traitCode]: { normalized } }
 * Returns: [{departmentId, code, name, fitScore}]
 */
function computeDepartmentScores({ departments, departmentWeights, traitScoresByCode }) {
  const weightsByDepartment = new Map();
  for (const w of departmentWeights) {
    if (!weightsByDepartment.has(w.departmentId)) weightsByDepartment.set(w.departmentId, []);
    weightsByDepartment.get(w.departmentId).push(w);
  }

  return departments.map((department) => {
    const weights = weightsByDepartment.get(department.id) || [];
    const weightSum = weights.reduce((sum, w) => sum + w.weight, 0);

    if (weights.length && Math.abs(weightSum - 1) > WEIGHT_SUM_TOLERANCE) {
      throw new AppError(
        500,
        `Department "${department.code}" trait weights sum to ${weightSum.toFixed(3)}, expected ~1.0 -- check v1_department_trait_weights`,
        ERROR_CODES.INTERNAL_ERROR
      );
    }

    const fitScore = Math.round(
      weights.reduce((sum, w) => sum + (traitScoresByCode[w.traitCode]?.normalized ?? 0) * w.weight, 0)
    );

    return { departmentId: department.id, code: department.code, name: department.name, fitScore };
  });
}

module.exports = { computeDepartmentScores };
