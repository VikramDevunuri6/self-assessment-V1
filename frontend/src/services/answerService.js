import api from "./api";

export async function saveAnswer({ sessionId, questionId, optionId }) {
  const { data } = await api.put("/answers", { sessionId, questionId, optionId });
  return data;
}
