import api from "./api";

export async function getResults(userId) {
  const { data } = await api.get(`/results/${userId}`);
  return data;
}
