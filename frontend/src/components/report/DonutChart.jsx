/**
 * Segmented trait donut wheel -- React port of
 * backend/src/reports/charts/donutSvg.js. Each wedge's angular share is
 * the trait's normalizedScore as a fraction of the sum of all 13 scores
 * (pure re-encoding of already-computed numbers, no new math, no curated
 * subset, and explicitly NOT a radar chart per the V2 design brief).
 *
 * Controlled 4-hue-family palette (blue/purple/green/orange, each with 4
 * tonal shades) instead of a 13-color rainbow -- keeps all 13 trait wedges
 * visually related rather than competing, per the V2.1 "color system" pass.
 */

const HUE_FAMILIES = [
  ["#0F3DDE", "#3D5CF5", "#6C8CFF", "#A9BBFF"], // blue
  ["#7B3FE4", "#9B6FF0", "#B98CFB", "#D9C2FF"], // purple
  ["#1F8F4D", "#27AE60", "#5FC987", "#9FE3BC"], // green
  ["#E67700", "#FF8A00", "#FFA53D", "#FFC878"], // orange
];

export function colorForIndex(i) {
  const family = HUE_FAMILIES[i % HUE_FAMILIES.length];
  const shade = Math.floor(i / HUE_FAMILIES.length);
  return family[Math.min(shade, family.length - 1)];
}

export function computeTraitShares(traits) {
  const total = traits.reduce((sum, t) => sum + Math.max(0, t.normalizedScore), 0) || 1;
  return traits.map((t, i) => ({
    code: t.code,
    name: t.name,
    score: t.normalizedScore,
    share: (Math.max(0, t.normalizedScore) / total) * 100,
    color: colorForIndex(i),
  }));
}

function buildWedge(cx, cy, outerR, innerR, a0, a1, color, key) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  const d = [
    `M ${p(outerR, a0)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p(outerR, a1)}`,
    `L ${p(innerR, a1)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p(innerR, a0)}`,
    "Z",
  ].join(" ");
  return <path key={key} d={d} fill={color} />;
}

export default function DonutChart({ traits, size = 230 }) {
  const shares = computeTraitShares(traits);
  const center = size / 2;
  const outerR = size * 0.49;
  const innerR = size * 0.27;
  const gapDeg = 1.4;

  let angle = -Math.PI / 2;
  const segments = shares.map((s, i) => {
    const sweep = (s.share / 100) * 2 * Math.PI;
    const gap = (gapDeg * Math.PI) / 180;
    const a0 = angle + gap / 2;
    const a1 = angle + sweep - gap / 2;
    angle += sweep;
    return buildWedge(center, center, outerR, innerR, a0, a1, s.color, s.code || i);
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {segments}
      <circle cx={center} cy={center} r={innerR - 1} fill="#ffffff" />
    </svg>
  );
}
