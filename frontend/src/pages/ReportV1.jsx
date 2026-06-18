import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import { getResultV1, downloadResultV1Pdf } from "../services/v1ResultService";
import RadarChart from "../components/report/RadarChart";
import {
  getCareerPotential,
  getCareerChips,
  deriveWorkingStyle,
  topNTraits,
  bottomNTraits,
  formatDuration,
  formatReportId,
} from "../lib/v1ReportPresentation";
import "../styles/ReportV1Executive.css";

const BAND_CLASS = {
  Exceptional: "band--exceptional",
  Strong: "band--strong",
  Developing: "band--developing",
  Emerging: "band--emerging",
};

function ScoreBar({ label, score }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="v1x-bar-row">
      <span className="v1x-bar-label">{label}</span>
      <div className="v1x-bar-track">
        <div className="v1x-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="v1x-bar-score">{pct}</span>
    </div>
  );
}

function PctCard({ label, score }) {
  return (
    <div className="v1x-pct-card">
      <span className="v1x-pct-value">{Math.round(score)}%</span>
      <span className="v1x-pct-label">{label}</span>
    </div>
  );
}

export default function ReportV1() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getResultV1(sessionId);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load this report");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadResultV1Pdf(sessionId);
    } catch (err) {
      console.error("Failed to download PDF", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="v1x-page v1x-loading">
        <p>Loading your report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="v1x-page v1x-error-screen">
        <p>{error}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="v1x-btn" onClick={() => navigate("/assessment")}>
            Go to Assessment
          </button>
          <Link className="v1x-btn" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { report, meta = {} } = result;
  const bandClass = BAND_CLASS[report.band] || "";

  const strengths = topNTraits(report.traits, 5);
  const growth = bottomNTraits(report.traits, 5);
  const careerPotential = getCareerPotential(report.traits);
  const careerChips = getCareerChips(report.careerSignals);
  const workingStyle = deriveWorkingStyle(report.traits);
  const duration = formatDuration(meta.startedAt, meta.completedAt);
  const reportId = formatReportId(meta.reportId);
  const generatedDate = result.generatedAt
    ? new Date(result.generatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="v1x-page">
      <div className="v1x-toolbar">
        <Link to="/dashboard" className="v1x-back">
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Link>
        <button type="button" className="v1x-btn" onClick={handleDownload} disabled={downloading}>
          <Download size={16} />
          <span>{downloading ? "Preparing…" : "Download PDF"}</span>
        </button>
      </div>

      <div className="v1x-sheet">
        <header className="v1x-banner">
          <div>
            <div className="v1x-brand">PersonaVerse · Self-Assessment Report</div>
            <div className="v1x-subtitle">Insights for Academic Growth &amp; Future Success</div>
          </div>
          <div className="v1x-student">
            <strong>{meta.studentName || "Student"}</strong>
            {meta.rollNumber || "—"} · {meta.branch || "—"} · {meta.passingYear || "—"}
            <br />
            Report {reportId} · {generatedDate}
          </div>
        </header>

        <div className="v1x-row">
          <div className="v1x-card v1x-score-card">
            <h4>Overall Potential</h4>
            <div>
              <span className="v1x-score-value">{report.overallScore}</span>
              <span className="v1x-score-suffix">/100</span>
            </div>
            <div className={`v1x-band-pill ${bandClass}`}>{report.band}</div>
          </div>

          <div className="v1x-card v1x-highlights">
            <h4>Report Highlights</h4>
            <div className="v1x-highlights-grid">
              <div className="v1x-highlight-item">
                Confidence
                <strong>
                  <span className={`v1x-confidence-pill v1x-confidence--${report.confidence.level.toLowerCase()}`}>
                    {report.confidence.level}
                  </span>
                </strong>
              </div>
              <div className="v1x-highlight-item">
                Reliability Score
                <strong>{Math.round(report.confidence.validityScore)}%</strong>
              </div>
              <div className="v1x-highlight-item">
                Questions Answered
                <strong>48 / 48</strong>
              </div>
              <div className="v1x-highlight-item">
                Assessment Duration
                <strong>{duration}</strong>
              </div>
              <div className="v1x-highlight-item">
                Traits Assessed
                <strong>{report.traits.length}</strong>
              </div>
              <div className="v1x-highlight-item">
                Status
                <strong>Completed</strong>
              </div>
            </div>
            {report.balancedProfileNote && <p className="v1x-balanced-note">{report.balancedProfileNote}</p>}
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card v1x-list-card">
            <h4>Top Strengths</h4>
            {strengths.map((t) => (
              <div className="v1x-list-item v1x-strength-item" key={t.code}>
                <span>{t.name}</span>
                <span>{Math.round(t.normalizedScore)}</span>
              </div>
            ))}
          </div>
          <div className="v1x-card v1x-list-card">
            <h4>Key Growth Areas</h4>
            {growth.map((t) => (
              <div className="v1x-list-item v1x-growth-item" key={t.code}>
                <span>{t.name}</span>
                <span>{Math.round(t.normalizedScore)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card v1x-radar-card">
            <div>
              <h4 style={{ textAlign: "center" }}>Trait Profile</h4>
              <RadarChart traits={report.traits} />
            </div>
          </div>
          <div className="v1x-card v1x-career-potential-card">
            <h4>Career Potential</h4>
            {careerPotential.map((c) => (
              <ScoreBar key={c.label} label={c.label} score={c.score} />
            ))}
          </div>
        </div>

        <div className="v1x-card">
          <h4>Department Fit</h4>
          <div className="v1x-dept-row">
            {report.departmentFit.map((d) => (
              <PctCard key={d.code} label={d.name} score={d.fitScore} />
            ))}
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card v1x-chips-card">
            <h4>Career Recommendations</h4>
            <div>
              {careerChips.map((chip) => (
                <span className="v1x-chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="v1x-card v1x-style-card">
            <h4>Working Style Summary</h4>
            <div className="v1x-style-grid">
              {Object.entries(workingStyle).map(([k, v]) => (
                <div className="v1x-style-item" key={k}>
                  {k}
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="v1x-card">
          <h4>Suggested Next Steps</h4>
          {(report.nextSteps || []).map((s, i) => (
            <div className="v1x-step" key={`${s.title}-${i}`}>
              <strong>{s.title}:</strong> <span>{s.content}</span>
            </div>
          ))}
        </div>

        <footer className="v1x-footer">
          <span>PersonaVerse Student Assessment · Confidential Report</span>
          <span>
            Generated {generatedDate} · {reportId}
          </span>
        </footer>
      </div>
    </div>
  );
}
