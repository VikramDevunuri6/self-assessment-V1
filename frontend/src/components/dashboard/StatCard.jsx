import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const EASE = [0.16, 1, 0.3, 1];

export default function StatCard({ title, value, index = 0 }) {
  const ref = useRef(null);
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });
  const spotX = useMotionValue("50%");
  const spotY = useMotionValue("50%");

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 12);
    rotateY.set((px - 0.5) * 12);
    spotX.set(`${px * 100}%`);
    spotY.set(`${py * 100}%`);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className="stat-card-wrap"
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: EASE }}
    >
      <div className="stat-card-float" style={{ animationDelay: `${index * 0.6}s` }}>
        <motion.div
          ref={ref}
          className="stat-card"
          style={{ rotateX, rotateY }}
          whileHover={{ y: -10, scale: 1.015 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-cursor="hover"
        >
          <motion.div
            className="stat-card-spotlight"
            style={{ "--x": spotX, "--y": spotY }}
          />
          <div className="stat-card-glow" />
          <h3>{title}</h3>
          <h1>
            <AnimatedCounter value={value} />
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
}
