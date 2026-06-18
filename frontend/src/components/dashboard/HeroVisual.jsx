import { useMemo } from "react";
import { motion } from "framer-motion";

const PARTICLES = [
  { top: "12%", left: "18%", size: 10, duration: 7, delay: 0 },
  { top: "22%", left: "78%", size: 14, duration: 9, delay: 0.6 },
  { top: "68%", left: "84%", size: 8, duration: 6.5, delay: 1.2 },
  { top: "80%", left: "22%", size: 12, duration: 8, delay: 0.3 },
  { top: "46%", left: "6%", size: 9, duration: 7.5, delay: 0.9 },
  { top: "8%", left: "52%", size: 7, duration: 6, delay: 1.5 },
  { top: "58%", left: "50%", size: 11, duration: 8.5, delay: 0.2 },
  { top: "88%", left: "62%", size: 6, duration: 5.5, delay: 1.8 },
];

export default function HeroVisual() {
  const particles = useMemo(() => PARTICLES, []);

  return (
    <div className="hero-visual" data-cursor="hover">
      {/* gradient mesh glow behind everything */}
      <div className="hero-visual-mesh" />

      {/* glow trails */}
      <div className="hero-trail trail-1" />
      <div className="hero-trail trail-2" />

      {/* animated rings */}
      <svg className="hero-ring ring-1" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="190" stroke="url(#ringGradientA)" strokeWidth="1.5" strokeDasharray="4 14" />
      </svg>
      <svg className="hero-ring ring-2" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="150" stroke="url(#ringGradientB)" strokeWidth="1" strokeDasharray="2 10" />
      </svg>
      <svg className="hero-ring ring-3" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="115" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" />
      </svg>

      {/* defs for gradients used above */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ringGradientA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="ringGradientB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* central glass sphere */}
      <div className="hero-sphere-wrap">
        <div className="hero-sphere">
          <div className="hero-sphere-highlight" />
          <div className="hero-sphere-core" />
        </div>
      </div>

      {/* floating particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="hero-particle"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{
            y: [0, -22, 0],
            x: [0, 10, 0],
            opacity: [0.35, 1, 0.35],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
