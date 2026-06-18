import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];

/**
 * Progress bar + stats strip for the assessment header.
 */
export default function ProgressIndicator({ current, total }) {
  const percent = Math.round(((current + 1) / total) * 100);

  return (
    <div className="pi-wrapper">
      <div className="pi-row">
        <div className="pi-brand">
          <Sparkles size={13} strokeWidth={2.5} aria-hidden="true" />
          <span>Self-Discovery Journey</span>
        </div>

        <div className="pi-stats" aria-live="polite" aria-atomic="true">
          <span className="pi-count">
            Question {current + 1} <em>/ {total}</em>
          </span>
          <span className="pi-percent">{percent}% Complete</span>
        </div>
      </div>

      <div
        className="pi-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Assessment progress: ${percent}% complete`}
      >
        <motion.div
          className="pi-fill"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: easeOut }}
        />
      </div>
    </div>
  );
}
