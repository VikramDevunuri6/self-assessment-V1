import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

const VARIANTS = {
  before: {
    initial: { opacity: 0, y: 90 },
    whileInView: { opacity: 1, y: 0 },
  },
  during: {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
  },
  after: {
    initial: { opacity: 0, y: 60, scale: 0.94 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
  },
};

export default function Timeline({ stages }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 60, damping: 24, restDelta: 0.001 });

  return (
    <div ref={containerRef} className="timeline-container">
      <div className="timeline-axis">
        <div className="timeline-axis-track" />
        <motion.div className="timeline-axis-fill" style={{ scaleY: lineScale }} />
      </div>

      <div className="timeline-stages">
        {stages.map((stage) => (
          <TimelineStage key={stage.number} stage={stage} />
        ))}
      </div>
    </div>
  );
}

function TimelineStage({ stage }) {
  const variant = VARIANTS[stage.kind];

  return (
    <motion.div
      className={`timeline-card-stage stage-${stage.kind}`}
      initial={variant.initial}
      whileInView={variant.whileInView}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="timeline-card-glow" />
      {stage.kind === "after" && <div className="timeline-card-expand" />}
      <span className="timeline-card-number">{stage.number}</span>

      <motion.div
        className="timeline-card-body"
        animate={stage.kind === "during" ? { y: [0, -14, 0] } : undefined}
        transition={
          stage.kind === "during"
            ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        <h2>{stage.title}</h2>
        <p>{stage.text}</p>
      </motion.div>
    </motion.div>
  );
}
