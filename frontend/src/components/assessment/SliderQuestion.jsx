import { memo, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// EDIT SECTION 3 LABELS HERE
// Change emoji, label text, or score mapping for any of the 4 points.
// Scores 1–4 correspond to option_order 1–4 in the database.
// ─────────────────────────────────────────────────────────────────────────────
const REACTIONS = [
  { score: 1, emoji: "😡", label: "Assalu kaadu" },
  { score: 2, emoji: "😕", label: "Konchem" },
  { score: 3, emoji: "😐", label: "Madhyalo" },
  { score: 4, emoji: "😀", label: "Exactly nene" },
];

// Pre-computed CSS calc widths for the blue progress fill at each score.
// Fill starts at left: 22px (dot-1 center) and spans N × (track_width − 44px).
const FILL_WIDTHS = [
  "0px",
  "calc((100% - 44px) / 3)",
  "calc(2 * (100% - 44px) / 3)",
  "calc(100% - 44px)",
];

/**
 * Maps a score (1–4) to itself.
 * Also accepts legacy 0–100 range as a fallback.
 * Exported so Assessment.jsx can commit the slider answer before navigation.
 */
export function sliderValueToScore(value) {
  if (value >= 1 && value <= 4) return Math.round(value);
  if (value <= 25) return 1;
  if (value <= 50) return 2;
  if (value <= 75) return 3;
  return 4;
}

function deriveInitialScore(question, savedOptionId) {
  if (!savedOptionId) return 2;
  const opt = question.question_options.find((o) => o.id === savedOptionId);
  return opt ? opt.option_order : 2;
}

/**
 * Section 3 — 4-point emoji slider
 * Scores: 😡=1  😕=2  😐=3  😀=4
 * sliderValue stores the selected score (1–4) directly.
 */
function SliderQuestion({
  question,
  questionNumber,
  imageSrc,
  savedOptionId,
  sliderValue,
  onSliderChange,
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && sliderValue === undefined) {
      initialized.current = true;
      onSliderChange(question.id, deriveInitialScore(question, savedOptionId));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedScore = sliderValue ?? deriveInitialScore(question, savedOptionId);

  return (
    <div className="slq-container">
      {/* EDIT SECTION 3 QUESTION HERE — update question_text via the database */}
      <p className="slq-question">{question.question_text}</p>

      <div className="slq-slider" role="radiogroup" aria-label="Select your response">

        {/* ── Emojis ──────────────────────────────────────────────────── */}
        <div className="slq-emojis" aria-hidden="true">
          {REACTIONS.map(({ score, emoji }) => (
            <motion.div
              key={score}
              className="slq-emoji-item"
              animate={{ scale: selectedScore === score ? 1.3 : 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* ── Track: grey line + blue fill + clickable dots ────────────── */}
        <div className="slq-track">
          {/* Grey baseline from dot-1 center to dot-4 center */}
          <div className="slq-track-bg" />

          {/* Blue fill — CSS transition handles smooth movement */}
          <div
            className="slq-track-fill"
            style={{ width: FILL_WIDTHS[selectedScore - 1] }}
          />

          {/* Dots — absolute, space-between, same width as dot-size */}
          <div className="slq-dots">
            {REACTIONS.map(({ score, emoji, label }) => {
              const selected = score === selectedScore;
              return (
                <motion.button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${emoji} — ${label}`}
                  className={`slq-dot${selected ? " slq-dot--selected" : ""}`}
                  onClick={() => onSliderChange(question.id, score)}
                  whileTap={{ scale: 0.78 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                />
              );
            })}
          </div>
        </div>

        {/* ── Labels — EDIT SECTION 3 LABELS HERE (see REACTIONS above) ── */}
        <div className="slq-labels" aria-hidden="true">
          {REACTIONS.map(({ score, label }) => (
            <div
              key={score}
              className={`slq-label-item${score === selectedScore ? " slq-label-item--active" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default memo(SliderQuestion);
