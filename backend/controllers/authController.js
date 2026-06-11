const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function signup(req, res) {
  try {
    const { user, profile } = await authService.signup(req.body);
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
      profile,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const user = await authService.login(req.body);
    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

async function getMe(req, res) {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

module.exports = { signup, login, getMe };
