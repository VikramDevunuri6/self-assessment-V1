const answerService = require("../services/answerService");

async function submitAnswers(req, res) {
  try {
    const { userId, answers } = req.body;
    const data = await answerService.submitAnswers(userId, answers);
    res.status(201).json({ message: "Answers submitted successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { submitAnswers };
