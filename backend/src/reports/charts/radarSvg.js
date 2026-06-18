const SHORT_NAMES = {
  communication_social_confidence: "Communication",
  empathy_interpersonal_sensitivity: "Empathy",
  discipline_time_management: "Discipline",
  leadership_initiative: "Leadership",
  resilience_emotional_stability: "Resilience",
  curiosity_learning_agility: "Curiosity",
  growth_mindset: "Growth Mindset",
  integrity_accountability: "Integrity",
  adaptability_change_readiness: "Adaptability",
  critical_thinking_problem_solving: "Critical Thinking",
  entrepreneurial_innovative_thinking: "Innovation",
  risk_appetite: "Risk Appetite",
  career_values_achievement_motivation: "Achievement",
};

/**
 * Hand-built SVG radar chart (no chart library -- this string is dropped
 * directly into the Puppeteer-rendered HTML, which can't run React/recharts
 * server-side). Consumes the same `traits` array (in display_order) the web
 * page's recharts RadarChart consumes, so both stay visually equivalent.
 */
function buildRadarSvg(traits, { size = 280 } = {}) {
  const center = size / 2;
  const maxRadius = size * 0.32;
  const labelRadius = size * 0.46;
  const n = traits.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const pointAt = (i, radius) => {
    const angle = startAngle + i * angleStep;
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
  };

  const gridRings = [0.25, 0.5, 0.75, 1]
    .map((frac) => {
      const points = traits.map((_, i) => pointAt(i, maxRadius * frac)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
      return `<polygon points="${points}" fill="none" stroke="#e5e7eb" stroke-width="1" />`;
    })
    .join("");

  const axisLines = traits
    .map((_, i) => {
      const p = pointAt(i, maxRadius);
      return `<line x1="${center}" y1="${center}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e5e7eb" stroke-width="1" />`;
    })
    .join("");

  const dataPolygon = traits
    .map((t, i) => pointAt(i, maxRadius * (Math.max(0, Math.min(100, t.normalizedScore)) / 100)))
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const labels = traits
    .map((t, i) => {
      const p = pointAt(i, labelRadius);
      const anchor = Math.abs(p.x - center) < 4 ? "middle" : p.x > center ? "start" : "end";
      const shortName = SHORT_NAMES[t.code] || t.name;
      return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" font-size="7" font-family="Inter, sans-serif" fill="#6b7280" text-anchor="${anchor}" dominant-baseline="middle">${shortName}</text>`;
    })
    .join("");

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${gridRings}${axisLines}<polygon points="${dataPolygon}" fill="#7c3aed" fill-opacity="0.25" stroke="#7c3aed" stroke-width="2" />${labels}</svg>`;
}

module.exports = { buildRadarSvg, SHORT_NAMES };
