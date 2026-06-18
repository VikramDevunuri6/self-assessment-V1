import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

/**
 * A transparent, absolutely-positioned tap-zone over one visual option inside an image.
 * Position values (top/left/width/height) are CSS strings, e.g. "55%", "4%".
 */
export default function OverlayOptionZone({
  position,
  optionKey,
  selected,
  onClick,
  tabIndex = 0,
}) {
  return (
    <motion.button
      type="button"
      className={`ooz instagram-option-${optionKey}${selected ? " ooz--selected" : ""}`}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
      }}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={`Option ${optionKey.toUpperCase()}`}
      aria-pressed={selected}
      whileTap={{ scale: 0.97 }}
    >
      <AnimatePresence>
        {selected && (
          <motion.div
            className="ooz-check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <Check size={12} strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
