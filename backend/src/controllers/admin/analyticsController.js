const analyticsService = require("../../services/admin/analyticsService");
const asyncHandler = require("../../utils/asyncHandler");

const getOverview = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getOverview());
});

const getTraitAverages = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getTraitAverages());
});

const getPersonalityDistribution = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getPersonalityDistribution());
});

const getCareerDistribution = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getCareerDistribution());
});

const getActiveUsers = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getActiveUsers(req.query));
});

const getTrends = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getTrends(req.query));
});

const getFunnel = asyncHandler(async (req, res) => {
  res.json(await analyticsService.getFunnel());
});

module.exports = {
  getOverview,
  getTraitAverages,
  getPersonalityDistribution,
  getCareerDistribution,
  getActiveUsers,
  getTrends,
  getFunnel,
};
