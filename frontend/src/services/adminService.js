import api from "./api";

// Users (Super Admin only)
export async function listUsers(params) {
  const { data } = await api.get("/admin/users", { params });
  return data;
}

export async function createAdminUser(payload) {
  const { data } = await api.post("/admin/users", payload);
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await api.put(`/admin/users/${id}/role`, { role });
  return data;
}

export async function setUserActive(id, isActive) {
  const { data } = await api.post(`/admin/users/${id}/${isActive ? "enable" : "disable"}`);
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/admin/users/${id}`);
}

// Students
export async function listStudents(params) {
  const { data } = await api.get("/admin/students", { params });
  return data;
}

export async function getStudent(id) {
  const { data } = await api.get(`/admin/students/${id}`);
  return data;
}

// Sessions
export async function listSessions(params) {
  const { data } = await api.get("/admin/sessions", { params });
  return data;
}

// Reports
export async function listReports(params) {
  const { data } = await api.get("/admin/reports", { params });
  return data;
}

export async function getReport(sessionId) {
  const { data } = await api.get(`/admin/reports/${sessionId}`);
  return data;
}

export async function regenerateReport(sessionId) {
  const { data } = await api.post("/admin/reports/regenerate", { sessionId });
  return data;
}

export async function getAnswerSheet(sessionId) {
  const { data } = await api.get(`/admin/reports/${sessionId}/answers`);
  return data;
}

export async function getScoreBreakdown(sessionId) {
  const { data } = await api.get(`/admin/reports/${sessionId}/breakdown`);
  return data;
}

// Questions
export async function listQuestions(params) {
  const { data } = await api.get("/admin/questions", { params });
  return data;
}

export async function getQuestion(id) {
  const { data } = await api.get(`/admin/questions/${id}`);
  return data;
}

export async function createQuestion(payload) {
  const { data } = await api.post("/admin/questions", payload);
  return data;
}

export async function updateQuestion(id, payload) {
  const { data } = await api.put(`/admin/questions/${id}`, payload);
  return data;
}

export async function deleteQuestion(id) {
  const { data } = await api.delete(`/admin/questions/${id}`);
  return data;
}

// Categories
export async function listCategories() {
  const { data } = await api.get("/admin/categories");
  return data;
}

export async function createCategory(payload) {
  const { data } = await api.post("/admin/categories", payload);
  return data;
}

// Traits
export async function listTraits() {
  const { data } = await api.get("/admin/traits");
  return data;
}

export async function createTrait(payload) {
  const { data } = await api.post("/admin/traits", payload);
  return data;
}

export async function updateTrait(id, payload) {
  const { data } = await api.put(`/admin/traits/${id}`, payload);
  return data;
}

// Trait <-> dimension weights
export async function listWeights() {
  const { data } = await api.get("/admin/trait-dimension-weights");
  return data;
}

export async function updateWeight(id, weight) {
  const { data } = await api.put(`/admin/trait-dimension-weights/${id}`, { weight });
  return data;
}

// Formulas
export async function listFormulas() {
  const { data } = await api.get("/admin/formulas");
  return data;
}

export async function publishFormulaVersion(code, definition) {
  const { data } = await api.post(`/admin/formulas/${code}/versions`, { definition });
  return data;
}

// Recommendations
export async function listRecommendations(params) {
  const { data } = await api.get("/admin/recommendations", { params });
  return data;
}

export async function createRecommendation(payload) {
  const { data } = await api.post("/admin/recommendations", payload);
  return data;
}

export async function updateRecommendation(id, payload) {
  const { data } = await api.put(`/admin/recommendations/${id}`, payload);
  return data;
}

export async function deleteRecommendation(id) {
  const { data } = await api.delete(`/admin/recommendations/${id}`);
  return data;
}

// Personality types
export async function listPersonalityTypes() {
  const { data } = await api.get("/admin/personality-types");
  return data;
}

export async function createPersonalityType(payload) {
  const { data } = await api.post("/admin/personality-types", payload);
  return data;
}

export async function updatePersonalityType(id, payload) {
  const { data } = await api.put(`/admin/personality-types/${id}`, payload);
  return data;
}

// Export
export async function exportData(resource, format = "json") {
  if (format === "csv") {
    const response = await api.get("/admin/export", { params: { resource, format }, responseType: "blob" });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resource}-export.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return null;
  }

  const { data } = await api.get("/admin/export", { params: { resource, format } });
  return data;
}

// Audit logs
export async function listAuditLogs(params) {
  const { data } = await api.get("/admin/audit-logs", { params });
  return data;
}

// Analytics
export async function getAnalyticsOverview() {
  const { data } = await api.get("/admin/analytics/overview");
  return data;
}

export async function getTraitAverages() {
  const { data } = await api.get("/admin/analytics/traits");
  return data;
}

export async function getPersonalityDistribution() {
  const { data } = await api.get("/admin/analytics/personality-distribution");
  return data;
}

export async function getCareerDistribution() {
  const { data } = await api.get("/admin/analytics/career-distribution");
  return data;
}

export async function getActiveUsers(days) {
  const { data } = await api.get("/admin/analytics/active-users", { params: { days } });
  return data;
}

export async function getTrends(days) {
  const { data } = await api.get("/admin/analytics/trends", { params: { days } });
  return data;
}

export async function getFunnel() {
  const { data } = await api.get("/admin/analytics/funnel");
  return data;
}
