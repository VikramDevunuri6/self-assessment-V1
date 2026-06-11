import api from "./api";

export async function submitAnswers(userId, answers) {
  const { data } = await api.post("/answers", { userId, answers });
  return data;
}
