import { useEffect, useRef } from "react";

export default function BackgroundLayers() {
  const rafRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;
      root.style.setProperty("--mx", current.x.toFixed(4));
      root.style.setProperty("--my", current.y.toFixed(4));
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="bg-layers" aria-hidden="true">
      {/* Layer 1: soft off-white base */}
      <div className="bg-base" />

      {/* Layer 2: large blurred purple radial gradients */}
      <div className="bg-radial bg-radial-a" />
      <div className="bg-radial bg-radial-b" />

      {/* Layer 5: subtle moving mesh gradient */}
      <div className="bg-mesh" />

      {/* Layer 3: animated floating glow orbs (cursor-reactive) */}
      <div className="bg-orb orb-1" data-depth="1">
        <div className="bg-orb-inner" />
      </div>
      <div className="bg-orb orb-2" data-depth="2">
        <div className="bg-orb-inner" />
      </div>
      <div className="bg-orb orb-3" data-depth="3">
        <div className="bg-orb-inner" />
      </div>

      {/* Layer 4: noise texture overlay */}
      <div className="bg-noise" />
    </div>
  );
}
