const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Validates req.body/params/query against a zod schema shaped as
 * z.object({ body: ..., params: ..., query: ... }) (each optional).
 * Replaces req.body/params/query with the parsed (coerced) data.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(new AppError(400, "Validation failed", ERROR_CODES.VALIDATION_ERROR, details));
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params;
    if (result.data.query !== undefined) req.query = result.data.query;

    next();
  };
}

module.exports = { validate };
