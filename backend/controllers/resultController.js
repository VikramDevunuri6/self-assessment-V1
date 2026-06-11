const resultService = require("../services/resultService");

async function getResults(req, res) {
  try {
    const { userId } = req.params;
    const data = await resultService.getResultsByUserId(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getResults };
