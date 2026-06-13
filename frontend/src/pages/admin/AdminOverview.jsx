import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  getAnalyticsOverview,
  getTraitAverages,
  getPersonalityDistribution,
  getCareerDistribution,
  getTrends,
  getFunnel,
} from "../../services/adminService";
import "../../styles/Admin.css";

const PIE_COLORS = ["#2563eb", "#60a5fa", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [traits, setTraits] = useState([]);
  const [personalityDist, setPersonalityDist] = useState([]);
  const [careerDist, setCareerDist] = useState([]);
  const [trends, setTrends] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [overviewData, traitData, personalityData, careerData, trendData, funnelData] = await Promise.all([
          getAnalyticsOverview(),
          getTraitAverages(),
          getPersonalityDistribution(),
          getCareerDistribution(),
          getTrends(30),
          getFunnel(),
        ]);

        setOverview(overviewData);
        setTraits(traitData);
        setPersonalityDist(personalityData);
        setCareerDist(careerData.slice(0, 8));
        setTrends(trendData);
        setFunnel(funnelData);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading analytics…</div>;
  }

  const maxFunnel = funnel.length ? funnel[0].count || 1 : 1;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Overview</h1>
          <p>Platform-wide analytics across students, sessions and reports.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {overview && (
        <div className="admin-stat-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{overview.totalStudents}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Total Sessions</span>
            <span className="stat-value">{overview.totalSessions}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{overview.completedSessions}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{overview.inProgressSessions}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Completion Rate</span>
            <span className="stat-value">{overview.completionRate}%</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Avg Confidence</span>
            <span className="stat-value">{overview.averageConfidence ?? "—"}</span>
          </div>
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Average Trait Scores</h3>
          {traits.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={traits} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No trait data yet</div>
          )}
        </div>

        <div className="admin-card">
          <h3>Personality Type Distribution</h3>
          {personalityDist.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={personalityDist}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {personalityDist.map((entry, index) => (
                    <Cell key={entry.code} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No completed reports yet</div>
          )}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Top Career Suggestions</h3>
          {careerDist.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={careerDist} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="title" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No career suggestions yet</div>
          )}
        </div>

        <div className="admin-card">
          <h3>Sessions Started vs Completed (30 days)</h3>
          {trends.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends}>
                <CartesianGrid stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(trends.length / 8)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="started" name="Started" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No session activity yet</div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h3>Conversion Funnel</h3>
        <div className="trait-bars">
          {funnel.map((stage) => (
            <div className="trait-bar-row" key={stage.stage} style={{ gridTemplateColumns: "180px 1fr 50px" }}>
              <span className="trait-bar-label">{stage.label}</span>
              <div className="trait-bar-track">
                <div
                  className="trait-bar-fill"
                  style={{ width: `${maxFunnel ? (stage.count / maxFunnel) * 100 : 0}%` }}
                />
              </div>
              <span className="trait-bar-score">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
