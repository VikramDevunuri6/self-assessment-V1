import api from "./api";

export async function getQuestions() {
  const { data } = await api.get("/questions");
  return data;
}
