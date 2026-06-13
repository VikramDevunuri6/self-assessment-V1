import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function splitValue(value) {
  const match = String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, numStr, suffix] = match;
  return { prefix, target: parseFloat(numStr), decimals: (numStr.split(".")[1] || "").length, suffix };
}

export default function AnimatedCounter({ value, duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const parsed = splitValue(value);
  const [display, setDisplay] = useState(parsed ? `${parsed.prefix}${(0).toFixed(parsed.decimals)}${parsed.suffix}` : value);

  useEffect(() => {
    if (!isInView || !parsed) return;

    const { prefix, target, decimals, suffix } = parsed;
    const start = performance.now();
    let raf;

    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {display}
    </motion.span>
  );
}
