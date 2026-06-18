const configService = require("../../services/admin/configService");
const asyncHandler = require("../../utils/asyncHandler");

// Categories

const listCategories = asyncHandler(async (req, res) => {
  res.json(await configService.listCategories());
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await configService.createCategory(req.body);
  res.locals.entityId = category.id;
  res.status(201).json(category);
});

// Traits

const listTraits = asyncHandler(async (req, res) => {
  res.json(await configService.listTraits());
});

const createTrait = asyncHandler(async (req, res) => {
  const trait = await configService.createTrait(req.body);
  res.locals.entityId = trait.id;
  res.status(201).json(trait);
});

const updateTrait = asyncHandler(async (req, res) => {
  res.json(await configService.updateTrait(req.params.id, req.body));
});

// Trait-dimension weights

const listWeights = asyncHandler(async (req, res) => {
  res.json(await configService.listWeights());
});

const updateWeight = asyncHandler(async (req, res) => {
  res.json(await configService.updateWeight(req.params.id, req.body.weight));
});

// Formulas

const listFormulas = asyncHandler(async (req, res) => {
  res.json(await configService.listFormulas());
});

const publishFormulaVersion = asyncHandler(async (req, res) => {
  const version = await configService.publishFormulaVersion(req.params.code, {
    definition: req.body.definition,
    adminId: req.user.userId,
  });
  res.locals.entityId = req.params.code;
  res.status(201).json(version);
});

// Recommendations

const listRecommendations = asyncHandler(async (req, res) => {
  res.json(await configService.listRecommendations(req.query));
});

const createRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await configService.createRecommendation(req.body);
  res.locals.entityId = recommendation.id;
  res.status(201).json(recommendation);
});

const updateRecommendation = asyncHandler(async (req, res) => {
  res.json(await configService.updateRecommendation(req.params.id, req.body));
});

const deleteRecommendation = asyncHandler(async (req, res) => {
  res.json(await configService.deleteRecommendation(req.params.id));
});

// Personality types

const listPersonalityTypes = asyncHandler(async (req, res) => {
  res.json(await configService.listPersonalityTypes());
});

const createPersonalityType = asyncHandler(async (req, res) => {
  const type = await configService.createPersonalityType(req.body);
  res.locals.entityId = type.id;
  res.status(201).json(type);
});

const updatePersonalityType = asyncHandler(async (req, res) => {
  res.json(await configService.updatePersonalityType(req.params.id, req.body));
});

module.exports = {
  listCategories,
  createCategory,
  listTraits,
  createTrait,
  updateTrait,
  listWeights,
  updateWeight,
  listFormulas,
  publishFormulaVersion,
  listRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  listPersonalityTypes,
  createPersonalityType,
  updatePersonalityType,
};
