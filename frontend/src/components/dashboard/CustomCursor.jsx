import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, { damping: 30, stiffness: 900, mass: 0.2 });
  const dotY = useSpring(mouseY, { damping: 30, stiffness: 900, mass: 0.2 });

  const ringX = useSpring(mouseX, { damping: 28, stiffness: 260, mass: 0.4 });
  const ringY = useSpring(mouseY, { damping: 28, stiffness: 260, mass: 0.4 });

  const glowX = useSpring(mouseX, { damping: 26, stiffness: 90, mass: 0.7 });
  const glowY = useSpring(mouseY, { damping: 26, stiffness: 90, mass: 0.7 });

  const enabled =
    !prefersReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches;

  useEffect(() => {
    if (!enabled) return;

    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const over = (e) => {
      if (e.target.closest && e.target.closest("[data-cursor]")) setHovered(true);
    };
    const out = (e) => {
      if (e.target.closest && e.target.closest("[data-cursor]")) setHovered(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <div className="cursor-layer" aria-hidden="true">
      <motion.div
        className="cursor-glow"
        style={{ x: glowX, y: glowY }}
        animate={{ scale: hovered ? 1.6 : 1, opacity: hovered ? 0.6 : 0.35 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hovered ? 1.8 : 1, opacity: hovered ? 1 : 0.7 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: hovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
