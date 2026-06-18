import api from "./api";

export async function getResult(sessionId) {
  const { data } = await api.get(`/results/${sessionId}`);
  return data;
}

export async function downloadResultPdf(sessionId) {
  const response = await api.get(`/results/${sessionId}/pdf`, { responseType: "blob" });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `assessment-report-${sessionId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
