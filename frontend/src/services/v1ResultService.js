import api from "./api";

export async function getResultV1(sessionId) {
  const { data } = await api.get(`/v1/results/${sessionId}`);
  return data;
}

export async function downloadResultV1Pdf(sessionId) {
  const response = await api.get(`/v1/results/${sessionId}/pdf`, { responseType: "blob" });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `assessment-report-v1-${sessionId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
