const assessmentRepository = require("../../repositories/assessmentRepository");
const resultRepository = require("../../repositories/resultRepository");

const EXPORT_LIMIT = 10000;

async function exportSessions() {
  const { data } = await assessmentRepository.listSessions({ from: 0, to: EXPORT_LIMIT - 1 });

  return data.map((session) => ({
    sessionId: session.id,
    userId: session.user_id,
    fullName: session.profiles?.full_name ?? "",
    email: session.profiles?.email ?? "",
    status: session.status,
    startedAt: session.started_at,
    completedAt: session.completed_at,
  }));
}

async function exportResults() {
  const { data } = await resultRepository.listResults({ from: 0, to: EXPORT_LIMIT - 1 });

  return data.map((result) => ({
    sessionId: result.session_id,
    userId: result.user_id,
    fullName: result.profiles?.full_name ?? "",
    email: result.profiles?.email ?? "",
    version: result.version,
    generatedAt: result.generated_at,
    personalityType: result.report_json?.personalityType?.name ?? "",
    confidence: result.report_json?.confidence ?? "",
  }));
}

async function exportData(resource) {
  return resource === "results" ? exportResults() : exportSessions();
}

function toCsv(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(","));
  }

  return lines.join("\n");
}

module.exports = { exportData, toCsv };
