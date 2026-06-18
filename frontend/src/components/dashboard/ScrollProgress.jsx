import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const percentage = useTransform(progress, (v) => Math.round(v * 100));
  const dashOffset = useTransform(progress, (v) => CIRCUMFERENCE * (1 - v));

  return (
    <>
      <motion.div className="scroll-progress-bar" style={{ scaleX: progress }} />

      <div className="scroll-progress-badge" data-cursor="hover">
        <svg width="48" height="48" viewBox="0 0 48 48" className="scroll-progress-ring">
          <circle cx="24" cy="24" r={RADIUS} className="scroll-ring-track" />
          <motion.circle
            cx="24"
            cy="24"
            r={RADIUS}
            className="scroll-ring-fill"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="scroll-progress-label">
          <motion.span>{percentage}</motion.span>
          <span className="scroll-progress-percent">%</span>
        </div>
      </div>
    </>
  );
}
