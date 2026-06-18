const sessionService = require("../../services/admin/sessionService");
const asyncHandler = require("../../utils/asyncHandler");

const listSessions = asyncHandler(async (req, res) => {
  const result = await sessionService.listSessions(req.query);
  res.json(result);
});

module.exports = { listSessions };
