import api from "./api";

export async function getLatestSession() {
  const { data } = await api.get("/assessment/latest");
  return data;
}

export async function startAssessment() {
  const { data } = await api.post("/assessment/start");
  return data;
}

export async function getQuestions(sessionId) {
  const { data } = await api.get(`/questions/${sessionId}`);
  return data;
}

export async function submitAssessment(sessionId) {
  const { data } = await api.post("/assessment/submit", { sessionId });
  return data;
}
