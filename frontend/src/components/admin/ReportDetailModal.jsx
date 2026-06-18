import { useEffect, useState } from "react";
import Modal from "./Modal";
import { getReport, regenerateReport } from "../../services/adminService";
import { downloadResultPdf } from "../../services/resultService";

function ScoreTable({ title, rows }) {
  if (!rows?.length) return null;

  return (
    <div className="admin-report-section">
      <h4>{title}</h4>
      <table className="admin-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.code}>
              <td>{row.name}</td>
              <td className="numeric">{Math.round(row.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentList({ title, items }) {
  if (!items?.length) return null;

  return (
    <details className="admin-report-section">
      <summary>{title} ({items.length})</summary>
      <ul className="admin-detail-list">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <strong>{item.title}</strong>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function ReportDetailModal({ sessionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getReport(sessionId);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setError(null);
      const result = await regenerateReport(sessionId);
      setData((prev) => ({ ...prev, version: result.version, report: result.report, generatedAt: new Date().toISOString() }));
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to regenerate report");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadResultPdf(sessionId);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal title="Report Detail" onClose={onClose}>
      {loading && <div className="admin-loading">Loading report…</div>}
      {error && <div className="admin-error">{error}</div>}

      {data && !loading && (
        <>
          <div className="admin-report-section">
            <h4>{data.report.personalityType?.name}</h4>
            <p>{data.report.personalityType?.description}</p>
            <p>
              <strong>Confidence:</strong> {Math.round(data.report.confidence)}% &middot;{" "}
              <strong>Version:</strong> {data.version} &middot;{" "}
              <strong>Generated:</strong> {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="admin-grid">
            <ScoreTable title="Trait Scores" rows={data.report.scores?.traits} />
            <div>
              <ScoreTable title="Big Five" rows={data.report.scores?.dimensions?.big_five} />
              <ScoreTable title="RIASEC" rows={data.report.scores?.dimensions?.riasec} />
            </div>
          </div>

          <ContentList title="Strengths" items={data.report.strengths} />
          <ContentList title="Growth Areas" items={data.report.weaknesses} />
          <ContentList title="Career Suggestions" items={data.report.careerSuggestions} />
          <ContentList title="Learning Recommendations" items={data.report.learningRecommendations} />
          <ContentList title="Interview Focus Areas" items={data.report.interviewFocusAreas} />

          <div className="admin-form-actions">
            <button type="button" className="admin-btn" onClick={handleDownload} disabled={downloading}>
              {downloading ? "Preparing…" : "Download PDF"}
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? "Regenerating…" : "Regenerate Report"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
