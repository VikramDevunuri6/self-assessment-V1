import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";

const EASE = [0.16, 1, 0.3, 1];

const PARTICLES = [
  { top: "18%", left: "12%", size: 6, duration: 6, delay: 0 },
  { top: "70%", left: "85%", size: 8, duration: 7.5, delay: 0.4 },
  { top: "30%", left: "78%", size: 5, duration: 6.5, delay: 1 },
  { top: "82%", left: "22%", size: 7, duration: 8, delay: 0.7 },
  { top: "50%", left: "50%", size: 4, duration: 5.5, delay: 1.4 },
  { top: "12%", left: "60%", size: 6, duration: 7, delay: 0.2 },
];

export default function CTASection({ title, description, buttonText, onButtonClick }) {
  return (
    <motion.div
      className="cta-box"
      initial={{ opacity: 0, y: 60, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="cta-aurora" />
      <div className="cta-beam" />

      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="cta-particle"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="cta-content">
        <h2>{title}</h2>
        <p>{description}</p>
        <MagneticButton className="cta-btn" strength={0.5} onClick={onButtonClick}>
          {buttonText}
        </MagneticButton>
      </div>
    </motion.div>
  );
}
