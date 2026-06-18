import { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Section 4 — This or That comparison cards
 *
 * Two full-width image cards (Option A / Option B) with a VS badge between them.
 * Images are loaded from /questions/thisorthat/q{questionNumber}-a.png etc.
 * Mobile: stacked vertically.  Desktop (≥ 640px): side by side.
 *
 * Selection saves via:
 *   onClick → onSelect(questionId, optionId)
 *           → handleSelectAndAdvance() in Assessment.jsx
 *           → commitAnswer() → saveAnswer({ sessionId, questionId, optionId })
 *           → PUT /api/answers  (upsert — re-selecting the same option is a no-op)
 *
 * To change question text: update question_text in the database.
 */
function ThisOrThatQuestion({
  question,
  questionNumber,
  answer,
  onSelect,
}) {
  const optionA = question.question_options[0];
  const optionB = question.question_options[1];

  // Images come from the backend (question_options[].image_url). The hardcoded
  // path is a fallback for the rare case the API doesn't return one.
  const optionAImage = optionA?.image_url || `/questions/thisorthat/q${questionNumber}-a.png`;
  const optionBImage = optionB?.image_url || `/questions/thisorthat/q${questionNumber}-b.png`;

  const handleSelect = useCallback(
    (optionId) => onSelect(question.id, optionId),
    [question.id, onSelect]
  );

  return (
    <div className="tot-container">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="tot-header">
        {/* EDIT SECTION 4 QUESTION HERE — update question_text via the database */}
        <p className="tot-question">{question.question_text}</p>
        <p className="tot-sub">Tap the illustration that best represents your choice.</p>
      </div>

      {/* ── Comparison cards ────────────────────────────────────────── */}
      <div className="tot-cards">

        {/* Option A */}
        {optionA && (
          <motion.button
            type="button"
            role="radio"
            aria-checked={answer === optionA.id}
            className={`tot-card tot-card--a${answer === optionA.id ? " tot-card--selected" : ""}`}
            onClick={() => handleSelect(optionA.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              src={optionAImage}
              alt={`Option A — ${optionA.option_text}`}
              className="tot-img"
              draggable={false}
            />

            <AnimatePresence>
              {answer === optionA.id && (
                <motion.span
                  className="tot-check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  aria-hidden="true"
                >
                  <Check size={13} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        {/* VS badge */}
        <div className="tot-vs" aria-hidden="true">VS</div>

        {/* Option B */}
        {optionB && (
          <motion.button
            type="button"
            role="radio"
            aria-checked={answer === optionB.id}
            className={`tot-card tot-card--b${answer === optionB.id ? " tot-card--selected" : ""}`}
            onClick={() => handleSelect(optionB.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: easeOut }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              src={optionBImage}
              alt={`Option B — ${optionB.option_text}`}
              className="tot-img"
              draggable={false}
            />

            <AnimatePresence>
              {answer === optionB.id && (
                <motion.span
                  className="tot-check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  aria-hidden="true"
                >
                  <Check size={13} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}

      </div>

      <p className="tot-hint" aria-hidden="true">Tap a card to choose</p>
    </div>
  );
}

export default memo(ThisOrThatQuestion);
