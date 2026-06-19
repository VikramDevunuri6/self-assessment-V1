import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import { getResultV1, downloadResultV1Pdf } from "../services/v1ResultService";
import { ReportIcon, IconBadge } from "../components/report/reportIcons";
import { AvatarIllustration, MountainTrophyIllustration, GrowthFlagIllustration, FinaleTrophyIllustration } from "../components/report/Illustrations";
import ScoreRing from "../components/report/ScoreRing";
import DonutChart, { computeTraitShares } from "../components/report/DonutChart";
import {
  getCareerPotential,
  getCareerChips,
  deriveWorkingStyle,
  getMindsetIndicators,
  getMindsetSummary,
  getInterviewFocusAreas,
  getLearningRecommendations,
  getDeptIcon,
  getDeptColor,
  topNTraits,
  bottomNTraits,
  formatDuration,
  formatReportId,
  formatStudentId,
} from "../lib/v1ReportPresentation";
import "../styles/ReportV1Executive.css";

const BAND_COLORS = {
  Exceptional: { fg: "#27AE60", bg: "#EAFBF0" },
  Strong: { fg: "#0F3DDE", bg: "#EAF0FF" },
  Developing: { fg: "#FF8A00", bg: "#FFF3E6" },
  Emerging: { fg: "#F64C72", bg: "#FFEAF0" },
};

const CONFIDENCE_COLORS = {
  High: { fg: "#27AE60", bg: "#EAFBF0" },
  Moderate: { fg: "#FF8A00", bg: "#FFF3E6" },
  Low: { fg: "#F64C72", bg: "#FFEAF0" },
};

function ProgressBar({ pct, colorFrom = "#7B3FE4", colorTo = "#B98CFB" }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="v1x-bar-track">
      <div className="v1x-bar-fill" style={{ width: `${v}%`, background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` }} />
    </div>
  );
}

/** Shared label/value row used by the profile card, working-style card and footer assessment-details column. */
function KvRow({ icon, color, label, value }) {
  return (
    <div className="v1x-kv-row">
      <IconBadge name={icon} color={color} size={26} iconSize={13} />
      <span className="v1x-kv-label">{label}</span>
      <span className="v1x-kv-value">{value}</span>
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
  const band = BAND_COLORS[report.band] || BAND_COLORS.Strong;
  const confidence = CONFIDENCE_COLORS[report.confidence.level] || CONFIDENCE_COLORS.Moderate;

  const strengths = topNTraits(report.traits, 5);
  const growth = bottomNTraits(report.traits, 5);
  const careerPotential = getCareerPotential(report.traits);
  const careerChips = getCareerChips(report.careerSignals);
  const workingStyle = deriveWorkingStyle(report.traits);
  const mindset = getMindsetIndicators(report.traits);
  const mindsetSummary = getMindsetSummary(mindset);
  const interviewFocus = getInterviewFocusAreas(report.growthAreas);
  const learningRecs = getLearningRecommendations(report.growthAreas);
  const duration = formatDuration(meta.startedAt, meta.completedAt);
  const reportId = formatReportId(meta.reportId);
  const studentId = formatStudentId(meta.reportId);
  const traitShares = computeTraitShares(report.traits);
  const overallPct = Math.max(0, Math.min(100, Math.round(report.overallScore)));
  const traitCoveragePct = Math.round((report.traits.length / 13) * 100);
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
        <header className="v1x-header">
          <div className="v1x-brandblock">
            <div className="v1x-logo"><ReportIcon name="sparkles" size={25} /></div>
            <div>
              <div className="v1x-brandname">PersonaVerse</div>
              <div className="v1x-tagline">Discover. Understand. Grow.</div>
            </div>
          </div>
          <div className="v1x-title">
            <h1>STUDENT POTENTIAL REPORT</h1>
            <div>Insights for Academic Growth &amp; Future Success</div>
          </div>
          <div className="v1x-right">
            <div className="v1x-datepill"><ReportIcon name="calendar" size={13} /> {generatedDate}</div>
            <div className="v1x-confbadge">CONFIDENTIAL REPORT</div>
          </div>
        </header>

        <div className="v1x-row">
          <div className="v1x-card v1x-profile-card">
            <div className="v1x-profile-head">
              <div className="v1x-avatar"><AvatarIllustration /></div>
              <div>
                <div className="v1x-profile-name">{meta.studentName || "Student"} <ReportIcon name="star" size={14} style={{ color: "#FF8A00" }} /></div>
                <div className="v1x-profile-tag">{reportId}</div>
              </div>
            </div>
            <KvRow icon="userCircle" color="#0F3DDE" label="Student ID" value={studentId} />
            <KvRow icon="graduationCap" color="#7B3FE4" label="Roll Number" value={meta.rollNumber || "—"} />
            <KvRow icon="layers" color="#2CB7F5" label="Branch" value={meta.branch || "—"} />
            <KvRow icon="calendar" color="#FF8A00" label="Passing Year" value={meta.passingYear || "—"} />
            <KvRow icon="target" color="#27AE60" label="Report ID" value={reportId} />
            <KvRow icon="checkCircle" color="#F64C72" label="Questions Attempted" value="48 / 48" />
          </div>

          <div className="v1x-card v1x-score-card">
            <div className="v1x-card-title" style={{ marginBottom: 0 }}>OVERALL POTENTIAL SCORE</div>
            <div className="v1x-score-ring-wrap">
              <ScoreRing score={overallPct} size={176} stroke={16} />
              <div className="v1x-score-ring-center">
                <b>{report.overallScore}</b>
                <span>OUT OF 100</span>
              </div>
            </div>
            <div className="v1x-band-pill" style={{ color: band.fg, background: band.bg }}>{report.band} Potential</div>
            <div className="v1x-score-desc">You demonstrate {report.band.toLowerCase()} abilities across multiple dimensions assessed in this report.</div>
          </div>

          <div className="v1x-card v1x-highlights-card">
            <div className="v1x-card-title"><IconBadge name="layers" color="#0F3DDE" /> Report Highlights</div>
            <div className="v1x-highlights-grid">
              <div className="v1x-hl-item">
                <IconBadge name="shieldCheck" color="#27AE60" />
                <div className="v1x-hl-text">Confidence Level<strong><span className="v1x-confidence-pill" style={{ color: confidence.fg, background: confidence.bg }}>{report.confidence.level}</span></strong></div>
              </div>
              <div className="v1x-hl-item">
                <IconBadge name="checkCircle" color="#0F3DDE" />
                <div className="v1x-hl-text">Reliability Score<strong>{Math.round(report.confidence.validityScore)}%</strong></div>
              </div>
              <div className="v1x-hl-item">
                <IconBadge name="target" color="#2CB7F5" />
                <div className="v1x-hl-text">Questions Answered<strong>48 / 48</strong></div>
              </div>
              <div className="v1x-hl-item">
                <IconBadge name="clock" color="#7B3FE4" />
                <div className="v1x-hl-text">Assessment Duration<strong>{duration}</strong></div>
              </div>
              <div className="v1x-hl-item">
                <IconBadge name="layers" color="#FF8A00" />
                <div className="v1x-hl-text">Trait Coverage<strong>{traitCoveragePct}%</strong></div>
              </div>
              <div className="v1x-hl-item">
                <IconBadge name="flag" color="#F64C72" />
                <div className="v1x-hl-text">Status<strong>Completed</strong></div>
              </div>
            </div>
            {report.balancedProfileNote && (
              <p className="v1x-balanced-note"><ReportIcon name="sparkles" size={13} /><span>{report.balancedProfileNote}</span></p>
            )}
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card v1x-list-card">
            <div className="v1x-card-title"><IconBadge name="trophy" color="#27AE60" /> Top Strengths</div>
            <div className="v1x-card-head">
              <div className="v1x-list-illu"><MountainTrophyIllustration /></div>
              <div className="v1x-item-list">
                {strengths.map((t) => (
                  <div className="v1x-item-row v1x-strength-row" key={t.code}>
                    <ReportIcon name="checkCircle" size={15} />
                    <span className="v1x-nm">{t.name}</span>
                    <span className="v1x-score-pip">{Math.round(t.normalizedScore)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="v1x-card v1x-list-card">
            <div className="v1x-card-title"><IconBadge name="trendUp" color="#FF8A00" /> Key Growth Areas</div>
            <div className="v1x-card-head">
              <div className="v1x-item-list">
                {growth.map((t) => (
                  <div className="v1x-item-row v1x-growth-row" key={t.code}>
                    <ReportIcon name="flag" size={15} />
                    <span className="v1x-nm">{t.name}</span>
                    <span className="v1x-score-pip">{Math.round(t.normalizedScore)}</span>
                  </div>
                ))}
              </div>
              <div className="v1x-list-illu"><GrowthFlagIllustration /></div>
            </div>
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card v1x-donut-card">
            <div className="v1x-card-title"><IconBadge name="userCircle" color="#7B3FE4" /> Trait Profile</div>
            <div className="v1x-donut-wrap">
              <DonutChart traits={report.traits} size={230} />
              <div className="v1x-donut-center"><IconBadge name="userCircle" color="#7B3FE4" size={58} iconSize={28} /></div>
            </div>
            <div className="v1x-legend">
              {traitShares.map((s) => (
                <div className="v1x-legend-item" key={s.code}>
                  <span className="v1x-legend-dot" style={{ background: s.color }} />
                  <span className="v1x-nm">{s.name}</span>
                  <span className="v1x-pc">{Math.round(s.share)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="v1x-card v1x-potential-card">
            <div className="v1x-card-title"><IconBadge name="sparkles" color="#7B3FE4" /> Potential Areas (Where You Shine)</div>
            {careerPotential.map((c) => (
              <div className="v1x-potential-row" key={c.label}>
                <IconBadge name={c.icon} color="#7B3FE4" />
                <div className="v1x-potential-text">
                  <div className="v1x-ptitle">{c.label}</div>
                  <div className="v1x-pdesc">{c.description}</div>
                </div>
                <ProgressBar pct={c.score} />
                <div className="v1x-potential-score">{Math.round(c.score)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="v1x-card">
          <div className="v1x-card-title"><IconBadge name="compass" color="#0F3DDE" /> Department Fit Analysis</div>
          <div className="v1x-dept-row">
            {report.departmentFit.map((d) => {
              const c = getDeptColor(d.code);
              return (
                <div className="v1x-dept-item" key={d.code}>
                  <div className="v1x-icon-badge" style={{ background: `${c}1f`, color: c, borderRadius: "50%", width: 40, height: 40 }}>
                    <ReportIcon name={getDeptIcon(d.code)} size={21} />
                  </div>
                  <span className="v1x-pct" style={{ color: c }}>{Math.round(d.fitScore)}%</span>
                  <span className="v1x-nm">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card">
            <div className="v1x-card-title"><IconBadge name="compass" color="#2CB7F5" /> Working Style Preferences</div>
            {workingStyle.map((s) => (
              <KvRow key={s.label} icon={s.icon} color="#2CB7F5" label={s.label} value={s.value} />
            ))}
          </div>
          <div className="v1x-card">
            <div className="v1x-card-title"><IconBadge name="shieldCheck" color="#7B3FE4" /> Mindset Indicators</div>
            <div className="v1x-mindset-tiles">
              {mindset.map((m) => (
                <div className="v1x-mindset-tile" key={m.label}>
                  <div className="v1x-icon-badge" style={{ background: `${m.color}1f`, color: m.color, borderRadius: "50%", width: 44, height: 44 }}>
                    <ReportIcon name={m.icon} size={22} />
                  </div>
                  <div className="v1x-mscore">{Math.round(m.score)}%</div>
                  <div className="v1x-mlabel">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="v1x-mindset-callout"><ReportIcon name="sparkles" size={17} /><span>{mindsetSummary}</span></div>
          </div>
        </div>

        <div className="v1x-row">
          <div className="v1x-card">
            <div className="v1x-card-title"><IconBadge name="messageCircle" color="#0F3DDE" /> Interview Focus Areas</div>
            <ul className="v1x-plain-list">
              {interviewFocus.map((line, i) => (
                <li key={i}><ReportIcon name="checkCircle" size={13} /><span>{line}</span></li>
              ))}
            </ul>
          </div>
          <div className="v1x-card">
            <div className="v1x-card-title"><IconBadge name="graduationCap" color="#0F3DDE" /> Learning Recommendations</div>
            <ul className="v1x-plain-list">
              {learningRecs.map((r) => (
                <li key={r}><ReportIcon name="checkCircle" size={13} /><span>{r}</span></li>
              ))}
            </ul>
            <div className="v1x-sub-title"><IconBadge name="briefcase" color="#2CB7F5" size={22} iconSize={12} /> Career Recommendations</div>
            <ul className="v1x-plain-list">
              {careerChips.map((c) => (
                <li key={c}><ReportIcon name="checkCircle" size={13} /><span>{c}</span></li>
              ))}
            </ul>
          </div>
          <div className="v1x-card">
            <div className="v1x-card-title"><IconBadge name="target" color="#F64C72" /> Suggested Next Steps</div>
            <ul className="v1x-plain-list">
              {(report.nextSteps || []).map((s, i) => (
                <li key={`${s.title}-${i}`}><ReportIcon name="flag" size={13} /><span><strong>{s.title}:</strong> {s.content}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="v1x-reco-banner">
          <div className="v1x-reco-trophy"><FinaleTrophyIllustration /></div>
          <div className="v1x-reco-headline">
            <div className="v1x-h1">OVERALL RECOMMENDATION: {report.band.toUpperCase()} POTENTIAL</div>
            <div className="v1x-h2">{report.band} performance across the assessed traits, with a clear, well-rounded foundation for academic and professional growth.</div>
          </div>
          <div className="v1x-reco-metrics">
            <div className="v1x-reco-metric">
              <div className="v1x-icon-badge" style={{ background: "#FF8A0033", color: "#FFD27A", borderRadius: "50%" }}><ReportIcon name="trophy" size={16} /></div>
              <div className="v1x-v">{report.overallScore}</div><div className="v1x-l">Overall Score</div>
            </div>
            <div className="v1x-reco-metric">
              <div className="v1x-icon-badge" style={{ background: "#2CB7F533", color: "#9FE3FF", borderRadius: "50%" }}><ReportIcon name="shieldCheck" size={16} /></div>
              <div className="v1x-v">{Math.round(report.confidence.validityScore)}%</div><div className="v1x-l">Reliability</div>
            </div>
            <div className="v1x-reco-metric">
              <div className="v1x-icon-badge" style={{ background: "#7B3FE433", color: "#D2BBFF", borderRadius: "50%" }}><ReportIcon name="layers" size={16} /></div>
              <div className="v1x-v">{traitCoveragePct}%</div><div className="v1x-l">Trait Coverage</div>
            </div>
            <div className="v1x-reco-metric">
              <div className="v1x-icon-badge" style={{ background: "#27AE6033", color: "#9CEFC0", borderRadius: "50%" }}><ReportIcon name="checkCircle" size={16} /></div>
              <div className="v1x-v">{report.confidence.level}</div><div className="v1x-l">Confidence</div>
            </div>
            <div className="v1x-reco-metric">
              <div className="v1x-icon-badge" style={{ background: "#0F3DDE33", color: "#AFC4FF", borderRadius: "50%" }}><ReportIcon name="target" size={16} /></div>
              <div className="v1x-v">48/48</div><div className="v1x-l">Questions Answered</div>
            </div>
          </div>
        </div>

        <div className="v1x-card v1x-footer-card">
          <div className="v1x-fcol v1x-about">
            <h4>About PersonaVerse</h4>
            <p>PersonaVerse uses psychometric science to help students discover potential, build skills and plan careers.</p>
          </div>
          <div className="v1x-fcol">
            <h4>Contact</h4>
            <div className="v1x-fcontact-row"><ReportIcon name="phone" size={13} /><span>+1 (555) 123-4567</span></div>
            <div className="v1x-fcontact-row"><ReportIcon name="mail" size={13} /><span>hello@personaverse.app</span></div>
            <div className="v1x-fcontact-row"><ReportIcon name="globe" size={13} /><span>www.personaverse.app</span></div>
          </div>
          <div className="v1x-fcol">
            <h4>Assessment Details</h4>
            <div className="v1x-fcontact-row"><ReportIcon name="layers" size={13} /><span>Tool: PersonaTrack V1</span></div>
            <div className="v1x-fcontact-row"><ReportIcon name="clock" size={13} /><span>Duration: {duration}</span></div>
            <div className="v1x-fcontact-row"><ReportIcon name="checkCircle" size={13} /><span>Status: Completed</span></div>
          </div>
          <div className="v1x-qrcol">
            <div className="v1x-qr"><ReportIcon name="qrCode" size={34} /></div>
            <div className="v1x-qrlabel">Scan to explore</div>
          </div>
        </div>

        <div className="v1x-note-bar">
          <ReportIcon name="lightbulb" size={16} />
          <span>This report reflects your responses to the assessment and is designed to support self-awareness and guidance conversations -- it works best alongside teacher and mentor input, not as a standalone decision.</span>
        </div>
      </div>
    </div>
  );
}
