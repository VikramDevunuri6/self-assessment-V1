import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import QuestionImage from "./QuestionImage";

// ─────────────────────────────────────────────────────────────────────────────
// EDIT OPTIONS HERE — placeholder text shown when backend returns no options.
//
// Real options are loaded from the API:
//   Assessment.jsx → getQuestions() → questions[n].question_options[]
//   Each entry: { id: string, option_text: string, option_order: number }
//
// Backend endpoint:  GET /api/questions  (see assessmentService.js)
// Database table:    question_options
//
// To change real option text update the database rows, NOT this file.
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_OPTIONS = [
  "I'll volunteer immediately and take responsibility.",
  "I'll join if the role matches my strengths.",
  "I'll observe first and decide later.",
  "I'd rather avoid leadership roles.",
];

const easeOut = [0.22, 1, 0.36, 1];

function InstagramStoryQuestion({
  question,
  questionNumber,
  answer,
  imageSrc,
  onSelect,
}) {
  // ── DB SAVE FLOW ────────────────────────────────────────────────────────────
  // click → onSelect(questionId, optionId)
  //       → handleSelectAndAdvance() in Assessment.jsx
  //       → commitAnswer() → saveAnswer({ sessionId, questionId, optionId })
  //       → PUT /api/answers  (upserts — no duplicates on re-selection)
  // On page refresh answers reload via getQuestions() → data.answers
  // ────────────────────────────────────────────────────────────────────────────
  const handleClick = useCallback(
    (optionId) => onSelect(question.id, optionId),
    [question.id, onSelect]
  );

  // Use real options from the backend when available; fall back to SAMPLE_OPTIONS.
  // EDIT OPTIONS HERE ↑ (or update the database for real content)
  const options =
    question.question_options.length > 0
      ? question.question_options
      : SAMPLE_OPTIONS.map((text, i) => ({ id: `temp-${i}`, option_text: text }));

  return (
    <div className="isq-card">

      {/* ── Illustration  top 63% of card ───────────────────────────────────── */}
      {/* The image already contains the badge ("COLLEGE LIFE") and question    */}
      {/* text as part of its design. DO NOT add separate HTML for these —      */}
      {/* that creates a visible duplicate above the illustration.              */}
      <div className="isq-illustration">
        <QuestionImage
          src={imageSrc}
          alt={`Question ${questionNumber}`}
          className="qi-wrapper--instagram"
        />
      </div>

      {/* ── Options  bottom 37% of card ────────────────────────────────────── */}
      {/* EDIT OPTIONS HERE → see SAMPLE_OPTIONS constant above                */}
      <div
        className="isq-options-list"
        role="radiogroup"
        aria-label="Select your answer"
      >
        {options.map((opt, index) => {
          const isSelected = answer === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`isq-option-btn${isSelected ? " isq-option-btn--selected" : ""}`}
              onClick={() => handleClick(opt.id)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 + index * 0.04, duration: 0.22, ease: easeOut }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="isq-option-glyph" aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="isq-option-text">{opt.option_text}</span>
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    className="isq-option-check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    aria-hidden="true"
                  >
                    <Check size={11} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}

export default memo(InstagramStoryQuestion);
