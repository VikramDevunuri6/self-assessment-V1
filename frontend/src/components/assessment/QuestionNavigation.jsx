import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

/**
 * Footer navigation: Back / hint strip / Continue or Submit.
 * For slider questions the hint text changes to reflect keyboard behavior.
 */
export default function QuestionNavigation({
  currentIndex,
  totalQuestions,
  hasAnswer,
  submitting,
  sectionType,
  onPrev,
  onNext,
  onSubmit,
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const hintText =
    sectionType === "slider"
      ? "← → adjust · Enter confirm"
      : sectionType === "thisorthat"
      ? "1 left · 2 right"
      : "1–4 select · ← → navigate";

  return (
    <div className="qnav-wrapper">
      <motion.button
        type="button"
        className="qnav-btn qnav-btn--ghost"
        onClick={onPrev}
        disabled={isFirst}
        whileHover={isFirst ? {} : { scale: 1.02, y: -1 }}
        whileTap={isFirst ? {} : { scale: 0.97 }}
        aria-label="Previous question"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        <span>Back</span>
      </motion.button>

      <span className="qnav-hint" aria-hidden="true">
        {hintText.split(" · ").map((chunk, i, arr) => (
          <span key={i}>
            <kbd>{chunk.split(" ")[0]}</kbd>{" "}
            {chunk.split(" ").slice(1).join(" ")}
            {i < arr.length - 1 && "  "}
          </span>
        ))}
      </span>

      {!isLast ? (
        <motion.button
          type="button"
          className="qnav-btn qnav-btn--primary"
          onClick={onNext}
          disabled={!hasAnswer}
          whileHover={hasAnswer ? { scale: 1.03, y: -2 } : {}}
          whileTap={hasAnswer ? { scale: 0.97 } : {}}
          aria-label="Next question"
        >
          <span>Continue</span>
          <ArrowRight size={17} aria-hidden="true" />
        </motion.button>
      ) : (
        <motion.button
          type="button"
          className="qnav-btn qnav-btn--submit"
          onClick={onSubmit}
          disabled={!hasAnswer || submitting}
          whileHover={hasAnswer && !submitting ? { scale: 1.03, y: -2 } : {}}
          whileTap={hasAnswer && !submitting ? { scale: 0.97 } : {}}
          aria-label="Submit assessment"
        >
          <span>{submitting ? "Submitting…" : "Submit"}</span>
          <Sparkles size={17} aria-hidden="true" />
        </motion.button>
      )}
    </div>
  );
}
