import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";

export default function SectionIndicators({ sections }) {
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    const observers = sections.map((id, i) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [sections]);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="section-indicators" aria-hidden="true">
      {sections.map((id, i) => (
        <button
          key={id}
          type="button"
          tabIndex={-1}
          className={`section-dot ${active === i ? "active" : ""}`}
          onClick={() => goTo(id)}
          data-cursor="hover"
        >
          <span className="section-dot-fill" />
        </button>
      ))}
    </div>
  );
}
