import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealUp } from "./RevealText";

export default function StoryStack({ title, description, cards }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="story-grid">
      <div className="story-left">
        <RevealUp>
          <h2>{title}</h2>
          <p>{description}</p>
        </RevealUp>
      </div>

      <div className="story-right">
        {cards.map((card, i) => (
          <StoryCard key={card.title} card={card} index={i} total={cards.length} progress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function StoryCard({ card, index, total, progress }) {
  const step = 1 / total;
  const start = index * step;
  const end = start + step;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const enterFrom = clamp01(isFirst ? 0 : start - step * 0.6);
  const enterTo = Math.max(enterFrom + 0.0001, clamp01(start));

  const exitFrom = clamp01(end);
  const exitTo = isLast ? exitFrom : Math.max(exitFrom + 0.0001, clamp01(end + step * 0.6));

  const y = useTransform(progress, [enterFrom, enterTo], [80, 0]);
  const scale = useTransform(progress, [enterFrom, enterTo, exitFrom, exitTo], [0.94, 1, 1, isLast ? 1 : 0.92]);
  const opacity = useTransform(progress, [enterFrom, enterTo, exitFrom, exitTo], [0, 1, 1, isLast ? 1 : 0.35]);

  return (
    <div className="story-card-spacer">
      <motion.div className="timeline-card story-card" style={{ y, scale, opacity, zIndex: index + 1 }}>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
      </motion.div>
    </div>
  );
}
