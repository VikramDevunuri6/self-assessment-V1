import { memo } from "react";
import { motion } from "framer-motion";

// Emoji per position only -- the 4 emoji are a fixed visual scale, but the
// label text is per-question, sourced from question_options (option_order
// 1–4), never hardcoded.
const EMOJIS = ["😡", "😕", "😐", "😀"];

function buildReactions(question) {
  return [...question.question_options]
    .sort((a, b) => a.option_order - b.option_order)
    .map((opt, i) => ({ score: opt.option_order, emoji: EMOJIS[i], label: opt.option_text }));
}

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

// Resolves the score from a previously saved answer only. Returns null when
// the question has never been answered -- callers must not invent a default.
function deriveScoreFromSavedAnswer(question, savedOptionId) {
  if (!savedOptionId) return null;
  const opt = question.question_options.find((o) => o.id === savedOptionId);
  return opt ? opt.option_order : null;
}

/**
 * Section 3 — 4-point emoji slider
 * Labels are per-question, read from question.question_options.
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
  // null = no selection yet -- nothing should appear active until the user
  // clicks a point or a previously saved answer exists for this question.
  const selectedScore = sliderValue ?? deriveScoreFromSavedAnswer(question, savedOptionId);
  const reactions = buildReactions(question);

  return (
    <div className="slq-container">
      {/* EDIT SECTION 3 QUESTION HERE — update question_text via the database */}
      <p className="slq-question">{question.question_text}</p>

      <div className="slq-slider" role="radiogroup" aria-label="Select your response">

        {/* ── Emojis ──────────────────────────────────────────────────── */}
        <div className="slq-emojis" aria-hidden="true">
          {reactions.map(({ score, emoji }) => (
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
            style={{ width: selectedScore === null ? "0px" : FILL_WIDTHS[selectedScore - 1] }}
          />

          {/* Dots — absolute, space-between, same width as dot-size */}
          <div className="slq-dots">
            {reactions.map(({ score, emoji, label }) => {
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

        {/* ── Labels — sourced from question_options, see buildReactions above ── */}
        <div className="slq-labels" aria-hidden="true">
          {reactions.map(({ score, label }) => (
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
