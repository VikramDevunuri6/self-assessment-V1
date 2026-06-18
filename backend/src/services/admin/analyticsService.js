const analyticsRepository = require("../../repositories/analyticsRepository");
const { ROLES } = require("../../constants/roles");
const { SESSION_STATUS } = require("../../constants/sessionStatus");

const CACHE_TTL_SECONDS = 300;
const DEFAULT_TREND_DAYS = 30;
const MAX_TREND_DAYS = 90;

function round2(value) {
  return Math.round(value * 100) / 100;
}

function parseDays(query) {
  const days = Math.trunc(Number(query?.days)) || DEFAULT_TREND_DAYS;
  return Math.min(MAX_TREND_DAYS, Math.max(1, days));
}

function startOfDaysAgo(days) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);
  return since;
}

function buildDateSeries(since, days) {
  const dates = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(since);
    date.setUTCDate(date.getUTCDate() + i);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

async function withCache(cacheKey, compute) {
  const cached = await analyticsRepository.getCache(cacheKey);
  if (cached) return cached;

  const payload = await compute();
  await analyticsRepository.setCache(cacheKey, payload, CACHE_TTL_SECONDS);
  return payload;
}

async function getOverview() {
  return withCache("overview", async () => {
    const [totalStudents, totalSessions, completedSessions, inProgressSessions, results] = await Promise.all([
      analyticsRepository.countProfilesByRole(ROLES.STUDENT),
      analyticsRepository.countSessions(),
      analyticsRepository.countSessions({ status: SESSION_STATUS.COMPLETED }),
      analyticsRepository.countSessions({ status: SESSION_STATUS.IN_PROGRESS }),
      analyticsRepository.getAllResults(),
    ]);

    const confidenceValues = results
      .map((result) => result.report_json?.confidence)
      .filter((value) => typeof value === "number");

    const averageConfidence = confidenceValues.length
      ? round2(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
      : null;

    return {
      totalStudents,
      totalSessions,
      completedSessions,
      inProgressSessions,
      completionRate: totalSessions ? round2((completedSessions / totalSessions) * 100) : 0,
      totalReportsGenerated: results.length,
      averageConfidence,
    };
  });
}

async function getTraitAverages() {
  return withCache("traits", async () => {
    const results = await analyticsRepository.getAllResults();
    const accum = {};

    for (const result of results) {
      const traits = result.report_json?.scores?.traits || [];
      for (const trait of traits) {
        if (typeof trait.score !== "number") continue;
        if (!accum[trait.code]) accum[trait.code] = { code: trait.code, name: trait.name, total: 0, count: 0 };
        accum[trait.code].total += trait.score;
        accum[trait.code].count += 1;
      }
    }

    return Object.values(accum).map(({ code, name, total, count }) => ({
      code,
      name,
      averageScore: round2(total / count),
      sampleSize: count,
    }));
  });
}

async function getPersonalityDistribution() {
  return withCache("personality-distribution", async () => {
    const results = await analyticsRepository.getAllResults();
    const counts = {};

    for (const result of results) {
      const type = result.report_json?.personalityType;
      if (!type?.code) continue;
      if (!counts[type.code]) counts[type.code] = { code: type.code, name: type.name, count: 0 };
      counts[type.code].count += 1;
    }

    const total = results.length;
    return Object.values(counts)
      .map((entry) => ({ ...entry, percentage: total ? round2((entry.count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  });
}

async function getCareerDistribution() {
  return withCache("career-distribution", async () => {
    const results = await analyticsRepository.getAllResults();
    const counts = {};

    for (const result of results) {
      const careers = result.report_json?.careerSuggestions || [];
      for (const career of careers) {
        if (!counts[career.title]) counts[career.title] = { title: career.title, count: 0 };
        counts[career.title].count += 1;
      }
    }

    return Object.values(counts).sort((a, b) => b.count - a.count);
  });
}

async function getActiveUsers(query) {
  const days = parseDays(query);

  return withCache(`active-users:${days}`, async () => {
    const since = startOfDaysAgo(days);
    const sessions = await analyticsRepository.getSessionsSince(since.toISOString());

    const byDate = {};
    for (const session of sessions) {
      const date = session.started_at.slice(0, 10);
      if (!byDate[date]) byDate[date] = new Set();
      byDate[date].add(session.user_id);
    }

    return buildDateSeries(since, days).map((date) => ({
      date,
      activeUsers: byDate[date]?.size ?? 0,
    }));
  });
}

async function getTrends(query) {
  const days = parseDays(query);

  return withCache(`trends:${days}`, async () => {
    const since = startOfDaysAgo(days);
    const sessions = await analyticsRepository.getSessionsSince(since.toISOString());

    const startedByDate = {};
    const completedByDate = {};
    for (const session of sessions) {
      const startedDate = session.started_at.slice(0, 10);
      startedByDate[startedDate] = (startedByDate[startedDate] || 0) + 1;

      if (session.completed_at) {
        const completedDate = session.completed_at.slice(0, 10);
        completedByDate[completedDate] = (completedByDate[completedDate] || 0) + 1;
      }
    }

    return buildDateSeries(since, days).map((date) => ({
      date,
      started: startedByDate[date] || 0,
      completed: completedByDate[date] || 0,
    }));
  });
}

async function getFunnel() {
  return withCache("funnel", async () => {
    const [totalStudents, startedSessions, completedSessions, results, pdfRows] = await Promise.all([
      analyticsRepository.countProfilesByRole(ROLES.STUDENT),
      analyticsRepository.countSessions(),
      analyticsRepository.countSessions({ status: SESSION_STATUS.COMPLETED }),
      analyticsRepository.getAllResults(),
      analyticsRepository.getPdfGeneratedSessionIds(),
    ]);

    const reportGenerated = new Set(results.map((result) => result.session_id)).size;
    const pdfDownloaded = new Set(pdfRows.map((row) => row.session_id)).size;

    return [
      { stage: "signed_up", label: "Signed Up", count: totalStudents },
      { stage: "started_assessment", label: "Started Assessment", count: startedSessions },
      { stage: "completed_assessment", label: "Completed Assessment", count: completedSessions },
      { stage: "report_generated", label: "Report Generated", count: reportGenerated },
      { stage: "pdf_downloaded", label: "PDF Downloaded", count: pdfDownloaded },
    ];
  });
}

module.exports = {
  getOverview,
  getTraitAverages,
  getPersonalityDistribution,
  getCareerDistribution,
  getActiveUsers,
  getTrends,
  getFunnel,
};
