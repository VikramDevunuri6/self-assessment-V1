import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export default function StrengthPill({ children, index = 0 }) {
  return (
    <div className="strength-pill-float" style={{ animationDelay: `${index * 0.45}s` }}>
      <motion.div
        className="strength-pill"
        initial={{ opacity: 0, y: 34, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.65, delay: index * 0.08, ease: EASE }}
        whileHover={{ scale: 1.06, y: -6 }}
        data-cursor="hover"
      >
        <span className="strength-pill-border" />
        <span className="strength-pill-glow" />
        <span className="strength-pill-label">{children}</span>
      </motion.div>
    </div>
  );
}
