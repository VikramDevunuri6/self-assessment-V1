const categoryRepository = require("../../repositories/categoryRepository");
const traitRepository = require("../../repositories/traitRepository");
const dimensionRepository = require("../../repositories/dimensionRepository");
const formulaRepository = require("../../repositories/formulaRepository");
const recommendationRepository = require("../../repositories/recommendationRepository");
const personalityTypeRepository = require("../../repositories/personalityTypeRepository");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

// Categories

async function listCategories() {
  return categoryRepository.getAllCategories();
}

async function createCategory({ code, name, description }) {
  return categoryRepository.createCategory({ code, name, description });
}

// Traits

async function listTraits() {
  return traitRepository.getAllTraits();
}

async function createTrait({ code, name, description }) {
  return traitRepository.createTrait({ code, name, description });
}

async function updateTrait(id, { name, description, isActive }) {
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (description !== undefined) fields.description = description;
  if (isActive !== undefined) fields.is_active = isActive;

  return traitRepository.updateTrait(id, fields);
}

// Trait-dimension weights

async function listWeights() {
  const rows = await dimensionRepository.listWeightsAdmin();

  return rows.map((row) => ({
    id: row.id,
    weight: Number(row.weight),
    trait: { id: row.traits.id, code: row.traits.code, name: row.traits.name },
    dimension: {
      id: row.dimensions.id,
      framework: row.dimensions.framework,
      code: row.dimensions.code,
      name: row.dimensions.name,
    },
  }));
}

async function updateWeight(id, weight) {
  const row = await dimensionRepository.updateWeight(id, weight);
  return { id: row.id, weight: Number(row.weight) };
}

// Formulas

async function listFormulas() {
  return formulaRepository.listFormulas();
}

async function publishFormulaVersion(code, { definition, adminId }) {
  const formula = await formulaRepository.getFormulaByCode(code);
  return formulaRepository.createVersion({ formulaId: formula.id, definition, createdBy: adminId });
}

// Recommendations

async function listRecommendations(query) {
  const pagination = parsePagination(query);
  const { data, count } = await recommendationRepository.getAllRecommendationsAdmin({
    ...pagination,
    type: query.type,
  });

  return { recommendations: data, pagination: buildPaginationMeta(pagination, count) };
}

async function createRecommendation(payload) {
  return recommendationRepository.createRecommendation({
    type: payload.type,
    trait_id: payload.traitId ?? null,
    dimension_id: payload.dimensionId ?? null,
    personality_type_id: payload.personalityTypeId ?? null,
    condition: payload.condition ?? {},
    title: payload.title,
    content: payload.content,
    priority: payload.priority ?? 0,
  });
}

async function updateRecommendation(id, payload) {
  const fields = {};
  if (payload.type !== undefined) fields.type = payload.type;
  if (payload.traitId !== undefined) fields.trait_id = payload.traitId;
  if (payload.dimensionId !== undefined) fields.dimension_id = payload.dimensionId;
  if (payload.personalityTypeId !== undefined) fields.personality_type_id = payload.personalityTypeId;
  if (payload.condition !== undefined) fields.condition = payload.condition;
  if (payload.title !== undefined) fields.title = payload.title;
  if (payload.content !== undefined) fields.content = payload.content;
  if (payload.priority !== undefined) fields.priority = payload.priority;
  if (payload.isActive !== undefined) fields.is_active = payload.isActive;

  return recommendationRepository.updateRecommendation(id, fields);
}

async function deleteRecommendation(id) {
  await recommendationRepository.updateRecommendation(id, { is_active: false });
  return { id, isActive: false };
}

// Personality types

async function listPersonalityTypes() {
  return personalityTypeRepository.getAllTypesAdmin();
}

async function createPersonalityType({ code, name, description, criteria, priority }) {
  return personalityTypeRepository.createType({ code, name, description, criteria: criteria ?? {}, priority: priority ?? 0 });
}

async function updatePersonalityType(id, { name, description, criteria, priority, isActive }) {
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (description !== undefined) fields.description = description;
  if (criteria !== undefined) fields.criteria = criteria;
  if (priority !== undefined) fields.priority = priority;
  if (isActive !== undefined) fields.is_active = isActive;

  return personalityTypeRepository.updateType(id, fields);
}

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
