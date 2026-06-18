import { motion, AnimatePresence } from "framer-motion";

/**
 * A transparent, absolutely-positioned tap-zone over one half (left/right) of a
 * This-or-That image. Position values are CSS strings, e.g. "50%".
 */
export default function OverlayChoiceZone({
  position,
  side,
  selected,
  onClick,
  tabIndex = 0,
}) {
  return (
    <motion.button
      type="button"
      className={`ocz this-or-that-${side}${selected ? " ocz--selected" : ""}`}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
      }}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={side === "left" ? "Choose left option" : "Choose right option"}
      aria-pressed={selected}
      whileTap={{ scale: 0.99 }}
    >
      <AnimatePresence>
        {selected && (
          <motion.div
            className="ocz-indicator"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            <motion.div
              className="ocz-pulse"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <svg
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="17" cy="17" r="16" fill="#2563eb" />
              <path
                d="M11 17l4.5 4.5 7.5-9"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
