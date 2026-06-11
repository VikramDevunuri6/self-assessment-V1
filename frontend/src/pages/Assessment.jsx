import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { getQuestions } from "../services/questionService";
import AssessmentIllustration from "../components/AssessmentIllustration";
import "../styles/Assessment.css";

const easeOut = [0.22, 1, 0.36, 1];

const stageVariants = {
  enter: {
    opacity: 0,
    y: 28,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -28,
  },
};

export default function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadQuestions();
  }, []);

  const question = questions[currentQuestion];

  const handleSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    console.log(answers);
  };

  // Keyboard navigation: 1-9 select an option, arrow up/down cycle
  // options, arrow left/right (and enter) move between questions.
  useEffect(() => {
    function handleKeyDown(e) {
      if (!question) return;
      const options = question.question_options;

      if (e.key >= "1" && e.key <= "9") {
        const index = Number(e.key) - 1;
        if (options[index]) {
          handleSelect(question.id, options[index].id);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const i = options.findIndex((o) => o.id === answers[question.id]);
          const next = i < options.length - 1 ? i + 1 : 0;
          handleSelect(question.id, options[next].id);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const i = options.findIndex((o) => o.id === answers[question.id]);
          const prev = i > 0 ? i - 1 : options.length - 1;
          handleSelect(question.id, options[prev].id);
          break;
        }
        case "ArrowRight":
        case "Enter":
          if (currentQuestion < questions.length - 1) {
            goNext();
          } else {
            handleSubmit();
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
  }, [question, answers, currentQuestion, questions.length]);

  if (!questions.length) {
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="assessment-page">
      <div className="assessment-card">
        <motion.header
          className="assessment-header"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <div className="header-row">
            <div className="brand-mark">
              <Sparkles size={14} strokeWidth={2.5} />
              <span>Self-Discovery Journey</span>
            </div>

            <div className="progress-stats">
              <span className="progress-count">
                Question {currentQuestion + 1} <em>/ {questions.length}</em>
              </span>
              <span className="progress-percent">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>

          <div className="progress-track">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: easeOut }}
            />
          </div>
        </motion.header>

        <main className="assessment-main">
          <div className="question-column">
            <AnimatePresence mode="wait">
              <motion.section
                key={question.id}
                className="question-stage"
                variants={stageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: easeOut }}
              >
                <span className="question-eyebrow">
                  Question {currentQuestion + 1}
                </span>

                <h1 className="question-text">{question.question_text}</h1>

                <div className="options-grid">
                  {question.question_options.map((option, index) => {
                    const isSelected = answers[question.id] === option.id;

                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        className={`option-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelect(question.id, option.id)}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.08 + index * 0.05,
                          duration: 0.4,
                          ease: easeOut,
                        }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="option-glyph">
                          {String.fromCharCode(65 + index)}
                        </span>

                        <span className="option-label">{option.option_text}</span>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              className="option-check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 28 }}
                            >
                              <Check size={14} strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>

          <div className="illustration-column">
            <AssessmentIllustration />
          </div>
        </main>

        <motion.footer
          className="assessment-footer"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
        >
          <button
            type="button"
            className="nav-btn nav-btn--ghost"
            onClick={goPrev}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <span className="footer-hint">
            <kbd>←</kbd>
            <kbd>→</kbd> navigate&nbsp;&nbsp;<kbd>1-9</kbd> select
          </span>

          {!isLastQuestion ? (
            <motion.button
              type="button"
              className="nav-btn nav-btn--primary"
              onClick={goNext}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              className="nav-btn nav-btn--submit"
              onClick={handleSubmit}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Submit Assessment</span>
              <Sparkles size={18} />
            </motion.button>
          )}
        </motion.footer>
      </div>
    </div>
  );
}
