import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAnswerSheet, getScoreBreakdown } from "../../services/adminService";
import StatusBadge from "../../components/admin/StatusBadge";
import ReportTab from "./session/ReportTab";
import AnswerSheetTab from "./session/AnswerSheetTab";
import QuestionReviewTab from "./session/QuestionReviewTab";
import ScoreBreakdownTab from "./session/ScoreBreakdownTab";
import ProfileGenerationTab from "./session/ProfileGenerationTab";
import "../../styles/Admin.css";

const TABS = [
  { key: "report", label: "Report" },
  { key: "answer-sheet", label: "Answer Sheet" },
  { key: "question-review", label: "Question Review" },
  { key: "score-breakdown", label: "Score Breakdown" },
  { key: "profile-generation", label: "Profile Generation" },
];

export default function AdminSessionDetail() {
  const { sessionId } = useParams();

  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [answerSheet, setAnswerSheet] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [answerSheetData, breakdownData] = await Promise.all([
          getAnswerSheet(sessionId),
          getScoreBreakdown(sessionId),
        ]);
        setAnswerSheet(answerSheetData);
        setBreakdown(breakdownData);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  if (loading) {
    return <div className="admin-loading">Loading session…</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link to="/admin/sessions" className="admin-back-link">
            <ArrowLeft size={14} />
            <span>Back to Sessions</span>
          </Link>
          <h1>{answerSheet.student?.fullName || "Session Detail"}</h1>
          <p>{answerSheet.student?.email}</p>
        </div>
        <div className="admin-page-actions">
          <StatusBadge status={answerSheet.status} />
          <span className="admin-badge admin-badge--muted">
            {answerSheet.answeredCount}/{answerSheet.totalQuestions} answered
          </span>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "report" && <ReportTab sessionId={sessionId} />}
      {activeTab === "answer-sheet" && <AnswerSheetTab data={answerSheet} />}
      {activeTab === "question-review" && <QuestionReviewTab data={answerSheet} />}
      {activeTab === "score-breakdown" && <ScoreBreakdownTab data={breakdown} />}
      {activeTab === "profile-generation" && <ProfileGenerationTab data={breakdown} />}
    </div>
  );
}
