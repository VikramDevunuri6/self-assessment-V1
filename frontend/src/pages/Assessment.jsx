import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { startAssessment, getQuestions, submitAssessment } from "../services/assessmentService";
import { saveAnswer } from "../services/answerService";
import AssessmentRenderer, { getSectionType } from "../components/assessment/AssessmentRenderer";
import ProgressIndicator from "../components/assessment/ProgressIndicator";
import QuestionNavigation from "../components/assessment/QuestionNavigation";
import { sliderValueToScore } from "../components/assessment/SliderQuestion";
import "../styles/Assessment.css";
import "../styles/AssessmentImage.css";

const easeOut = [0.22, 1, 0.36, 1];

// Resolves the image URL(s) a given question will render, for preloading.
function getPreloadUrls(question) {
  if (question.question_type === "thisorthat") {
    return question.question_options
      .slice(0, 2)
      .map((opt) => opt.image_url)
      .filter(Boolean);
  }
  return question.image_url ? [question.image_url] : [];
}

export default function Assessment() {
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const session = await startAssessment();
        const data = await getQuestions(session.sessionId);
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setAnswers(data.answers || {});
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load the assessment");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Warm the browser's image cache for upcoming questions so their images
  // are already loaded by the time the user navigates to them.
  useEffect(() => {
    const PRELOAD_AHEAD = 3;
    for (let i = currentQuestion + 1; i <= currentQuestion + PRELOAD_AHEAD; i++) {
      const upcoming = questions[i];
      if (!upcoming) continue;
      for (const url of getPreloadUrls(upcoming)) {
        const img = new Image();
        img.src = url;
      }
    }
  }, [currentQuestion, questions]);

  const question = questions[currentQuestion];
  const sectionType = getSectionType(question);

  // --- Answer helpers ---

  const commitAnswer = useCallback(
    (questionId, optionId) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      saveAnswer({ sessionId, questionId, optionId }).catch((err) =>
        console.error("Failed to save answer", err)
      );
    },
    [sessionId]
  );

  // Used by Instagram Story, Scenario MCQ, This or That — selects and auto-advances
  const handleSelectAndAdvance = useCallback(
    (questionId, optionId) => {
      commitAnswer(questionId, optionId);
      // Auto-advance after a short delay to show selection feedback
      setTimeout(() => {
        setCurrentQuestion((prev) =>
          prev < questions.length - 1 ? prev + 1 : prev
        );
      }, 380);
    },
    [commitAnswer, questions.length]
  );

  // Used by keyboard ArrowUp/Down — selects without advancing
  const handleSelectOnly = useCallback(
    (questionId, optionId) => {
      commitAnswer(questionId, optionId);
    },
    [commitAnswer]
  );

  const handleSliderChange = useCallback((questionId, value) => {
    setSliderValues((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // Commit the current slider answer before advancing
  const commitSliderAnswer = useCallback(() => {
    if (!question || sectionType !== "slider") return;
    const val = sliderValues[question.id] ?? 2; // default score 2 (🙂)
    const score = sliderValueToScore(val);
    const sorted = [...question.question_options].sort(
      (a, b) => a.option_order - b.option_order
    );
    const optionId = sorted[score - 1]?.id;
    if (optionId) commitAnswer(question.id, optionId);
  }, [question, sectionType, sliderValues, commitAnswer]);

  // --- Navigation ---

  const goNext = useCallback(() => {
    if (sectionType === "slider") commitSliderAnswer();
    setCurrentQuestion((prev) =>
      prev < questions.length - 1 ? prev + 1 : prev
    );
  }, [sectionType, commitSliderAnswer, questions.length]);

  const goPrev = useCallback(() => {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (sectionType === "slider") commitSliderAnswer();
    try {
      setSubmitting(true);
      setError(null);
      const result = await submitAssessment(sessionId);
      navigate(`/report/${result.sessionId}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to submit the assessment");
      setSubmitting(false);
    }
  }, [submitting, sectionType, commitSliderAnswer, sessionId, navigate]);

  // --- Keyboard navigation ---

  useEffect(() => {
    function handleKeyDown(e) {
      if (!question) return;
      const options = question.question_options;
      const type = getSectionType(question);

      if (type === "slider") {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          const cur = sliderValues[question.id] ?? 2;
          handleSliderChange(question.id, Math.max(1, cur - 1));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          const cur = sliderValues[question.id] ?? 2;
          handleSliderChange(question.id, Math.min(4, cur + 1));
        } else if (e.key === "Enter") {
          if (currentQuestion < questions.length - 1) goNext();
          else handleSubmit();
        }
        return;
      }

      if (type === "thisorthat") {
        const handleKey = (optionIndex) => {
          const opt = options[optionIndex];
          if (opt) handleSelectAndAdvance(question.id, opt.id);
        };
        if (e.key === "1" || e.key === "ArrowLeft") { e.preventDefault(); handleKey(0); }
        else if (e.key === "2" || e.key === "ArrowRight") { e.preventDefault(); handleKey(1); }
        return;
      }

      // Instagram Story + Scenario MCQ
      if (e.key >= "1" && e.key <= "4") {
        const opt = options[Number(e.key) - 1];
        if (opt) handleSelectAndAdvance(question.id, opt.id);
        return;
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const i = options.findIndex((o) => o.id === answers[question.id]);
          const next = i < options.length - 1 ? i + 1 : 0;
          handleSelectOnly(question.id, options[next].id);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const i = options.findIndex((o) => o.id === answers[question.id]);
          const prev = i > 0 ? i - 1 : options.length - 1;
          handleSelectOnly(question.id, options[prev].id);
          break;
        }
        case "ArrowRight":
        case "Enter":
          if (answers[question.id] !== undefined) {
            if (currentQuestion < questions.length - 1) goNext();
            else handleSubmit();
          }
          break;
        case "ArrowLeft":
          goPrev();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, answers, currentQuestion, questions.length, sliderValues, sessionId]);

  // --- Derived state ---

  const hasAnswer =
    sectionType === "slider"
      ? true
      : answers[question?.id] !== undefined;

  // --- Render: loading ---

  if (error && !questions.length) {
    return (
      <div className="assessment-page assessment-loading">
        <motion.div
          className="loading-content"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <p className="loading-text">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (loading || !questions.length) {
    return (
      <div className="assessment-page assessment-loading">
        <motion.div
          className="loading-content"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <motion.span
            className="loading-orb"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="loading-text">Curating your journey…</p>
        </motion.div>
      </div>
    );
  }

  // --- Render: assessment ---

  return (
    <div className="assessment-page">
      <div className="assessment-card">

        {/* Header with progress */}
        <motion.header
          className="assessment-header"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <ProgressIndicator
            current={currentQuestion}
            total={questions.length}
          />
        </motion.header>

        {/* Main content */}
        <main className={`assessment-main assessment-main--${sectionType}`}>
          <div className="question-column">
            {error && (
              <div className="assessment-inline-error" role="alert">
                {error}
              </div>
            )}

            <AssessmentRenderer
              question={question}
              questionIndex={currentQuestion}
              answer={answers[question.id]}
              sliderValue={sliderValues[question.id]}
              onSelect={handleSelectAndAdvance}
              onSliderChange={handleSliderChange}
            />
          </div>
        </main>

        {/* Footer navigation */}
        <motion.footer
          className="assessment-footer"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
        >
          <QuestionNavigation
            currentIndex={currentQuestion}
            totalQuestions={questions.length}
            hasAnswer={hasAnswer}
            submitting={submitting}
            sectionType={sectionType}
            onPrev={goPrev}
            onNext={goNext}
            onSubmit={handleSubmit}
          />
        </motion.footer>

      </div>
    </div>
  );
}
