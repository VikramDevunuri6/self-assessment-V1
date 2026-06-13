import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ArrowLeft, Sparkles, TrendingUp, Briefcase, BookOpen, MessageSquare } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { getResult, downloadResultPdf } from "../services/resultService";
import "../styles/Report.css";

const easeOut = [0.22, 1, 0.36, 1];

const FRAMEWORK_LABELS = {
  big_five: "Big Five Personality",
  riasec: "RIASEC Career Interests",
};

function DimensionRadar({ title, data }) {
  if (!data?.length) return null;

  const chartData = data.map((dimension) => ({
    subject: dimension.code,
    fullName: dimension.name,
    score: dimension.score,
  }));

  return (
    <div className="report-card radar-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
          <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.28} />
        </RadarChart>
      </ResponsiveContainer>
      <ul className="radar-legend">
        {chartData.map((entry) => (
          <li key={entry.subject}>
            <span className="radar-legend-code">{entry.subject}</span>
            <span className="radar-legend-name">{entry.fullName}</span>
            <span className="radar-legend-score">{Math.round(entry.score)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TraitBars({ traits }) {
  if (!traits?.length) return null;

  return (
    <div className="report-card">
      <h3>Trait Scores</h3>
      <div className="trait-bars">
        {traits.map((trait) => (
          <div className="trait-bar-row" key={trait.code}>
            <span className="trait-bar-label">{trait.name}</span>
            <div className="trait-bar-track">
              <motion.div
                className="trait-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${trait.score}%` }}
                transition={{ duration: 0.8, ease: easeOut }}
              />
            </div>
            <span className="trait-bar-score">{Math.round(trait.score)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationList({ icon, title, items, className }) {
  if (!items?.length) return null;

  return (
    <div className={`report-card ${className || ""}`}>
      <h3>
        {icon}
        {title}
      </h3>
      <ul className="recommendation-list">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <strong>{item.title}</strong>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Report() {
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
        const data = await getResult(sessionId);
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
      await downloadResultPdf(sessionId);
    } catch (err) {
      console.error("Failed to download PDF", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-page report-loading">
        <motion.span
          className="report-loading-orb"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <p>Loading your report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page report-loading">
        <p className="report-error">{error}</p>
        <div className="report-error-actions">
          <button type="button" className="report-btn report-btn--primary" onClick={() => navigate("/assessment")}>
            Go to Assessment
          </button>
          <Link className="report-btn report-btn--ghost" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { report } = result;
  const { personalityType, scores, confidence } = report;

  return (
    <div className="report-page">
      <div className="report-shell">
        <motion.header
          className="report-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <Link to="/dashboard" className="report-back">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>

          <button type="button" className="report-btn report-btn--primary" onClick={handleDownload} disabled={downloading}>
            <Download size={16} />
            <span>{downloading ? "Preparing…" : "Download PDF"}</span>
          </button>
        </motion.header>

        <motion.section
          className="report-card hero-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
        >
          <span className="hero-tag">
            <Sparkles size={14} strokeWidth={2.5} />
            Your Personality Archetype
          </span>
          <h1>{personalityType.name}</h1>
          <p className="hero-description">{personalityType.description}</p>

          <div className="confidence-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" className="confidence-track" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="confidence-fill"
                strokeDasharray={`${(confidence / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              />
            </svg>
            <div className="confidence-value">
              <span>{Math.round(confidence)}%</span>
              <small>Confidence</small>
            </div>
          </div>
        </motion.section>

        <div className="report-grid">
          <DimensionRadar title={FRAMEWORK_LABELS.big_five} data={scores.dimensions.big_five} />
          <DimensionRadar title={FRAMEWORK_LABELS.riasec} data={scores.dimensions.riasec} />
        </div>

        <TraitBars traits={scores.traits} />

        <div className="report-grid">
          <RecommendationList
            icon={<TrendingUp size={16} />}
            title="Strengths"
            items={report.strengths}
            className="strengths-card"
          />
          <RecommendationList
            icon={<TrendingUp size={16} />}
            title="Growth Areas"
            items={report.weaknesses}
            className="weaknesses-card"
          />
        </div>

        <RecommendationList icon={<Briefcase size={16} />} title="Career Suggestions" items={report.careerSuggestions} />
        <RecommendationList icon={<BookOpen size={16} />} title="Learning Recommendations" items={report.learningRecommendations} />
        <RecommendationList icon={<MessageSquare size={16} />} title="Interview Focus Areas" items={report.interviewFocusAreas} />
      </div>
    </div>
  );
}
