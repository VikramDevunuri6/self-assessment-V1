import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import QuestionImage from "./QuestionImage";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Section 1 — Scenario MCQ
 *
 * Image (portrait, designed with an empty lower area) fills the available
 * viewport height. Answer buttons are absolutely overlaid in that lower
 * empty area so no scrolling is needed.
 *
 * Selection saves via:
 *   onClick → onSelect(questionId, optionId)
 *           → handleSelectAndAdvance() in Assessment.jsx  (auto-advances)
 *           → commitAnswer() → saveAnswer({ sessionId, questionId, optionId })
 *           → PUT /api/answers
 *
 * To change option text: update question_options in the database.
 * To change the image: replace the file at imagePaths[questionNumber].
 */
function ScenarioQuestion({
  question,
  questionNumber,
  answer,
  imageSrc,
  onSelect,
}) {
  return (
    <div className="sq-container">

      {/* ── Full-height image ──────────────────────────────────────────── */}
      {/* object-fit: contain keeps the full image visible (no crop).      */}
      {/* object-position: top shows badge + character; empty gradient     */}
      {/* area at bottom is where the overlay buttons sit.                 */}
      <div className="sq-img-wrapper">
        <QuestionImage
          src={imageSrc}
          alt={`Question ${questionNumber} scenario`}
          className="qi-wrapper--scenario"
        />
      </div>

      {/* ── Overlay buttons — pinned to lower portion of image ─────────── */}
      {/* EDIT OPTION TEXT → update question_options in the database.      */}
      <div
        className="sq-options-overlay"
        role="radiogroup"
        aria-label="Answer options"
      >
        {question.question_options.map((option, index) => {
          const isSelected = answer === option.id;

          return (
            <motion.button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`sq-overlay-btn${isSelected ? " sq-overlay-btn--selected" : ""}`}
              onClick={() => onSelect(question.id, option.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.04 + index * 0.04,
                duration: 0.26,
                ease: easeOut,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="sq-overlay-glyph">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="sq-overlay-label">{option.option_text}</span>

              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    className="sq-overlay-check"
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

export default memo(ScenarioQuestion);
