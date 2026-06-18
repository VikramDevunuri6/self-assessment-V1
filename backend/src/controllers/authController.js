const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const signup = asyncHandler(async (req, res) => {
  const { profile, role, accessToken, refreshToken } = await authService.signup(req.body);

  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: profile.id, email: profile.email, role },
    profile,
  });
});

const login = asyncHandler(async (req, res) => {
  const { userId, email, role, accessToken, refreshToken } = await authService.login(req.body);

  res.json({
    accessToken,
    refreshToken,
    user: { id: userId, email, role },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json(tokens);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});

const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.userId);
  res.json(profile);
});

module.exports = { signup, login, refresh, logout, getMe };
