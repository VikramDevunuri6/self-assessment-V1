const questionService = require("../services/questionService");

async function getQuestions(req, res) {
  try {
    const questions = await questionService.getAllQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getQuestions };
