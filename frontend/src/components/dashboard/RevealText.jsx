import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export function RevealLines({ lines, className = "", lineClassName = "", delay = 0, stagger = 0.12 }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={line} className={`reveal-line ${lineClassName}`}>
          <motion.span
            className="reveal-line-inner"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function RevealUp({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
