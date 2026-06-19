/**
 * Controlled 4-hue-family palette (blue/purple/green/orange, each with 4
 * tonal shades) instead of a 7-color-plus-tints rainbow -- keeps all 13
 * trait wedges visually related rather than competing, per the V2.1
 * "color system" design pass.
 */
const HUE_FAMILIES = [
  ["#0F3DDE", "#3D5CF5", "#6C8CFF", "#A9BBFF"], // blue
  ["#7B3FE4", "#9B6FF0", "#B98CFB", "#D9C2FF"], // purple
  ["#1F8F4D", "#27AE60", "#5FC987", "#9FE3BC"], // green
  ["#E67700", "#FF8A00", "#FFA53D", "#FFC878"], // orange
];

function colorForIndex(i) {
  const family = HUE_FAMILIES[i % HUE_FAMILIES.length];
  const shade = Math.floor(i / HUE_FAMILIES.length);
  return family[Math.min(shade, family.length - 1)];
}

/**
 * Renders the 13 traits as a segmented donut: each wedge's angular share is
 * the trait's normalizedScore as a fraction of the sum of all 13 scores --
 * a pure re-encoding of the same already-computed numbers (no new math, no
 * curated subset), so the wheel always accounts for the complete trait
 * profile rather than a cherry-picked handful. Rendered as a thick ring
 * (per the V2.1 pass: "fewer tiny labels, thicker segments, stronger
 * center graphic") rather than a thin pie-style donut.
 */
function buildDonutSvg(traits, { size = 260, traitShares } = {}) {
  const shares = traitShares || computeShares(traits);
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
    const color = colorForIndex(i);
    return buildWedge(center, center, outerR, innerR, a0, a1, color);
  });

  return {
    svg: `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${segments.join("")}<circle cx="${center}" cy="${center}" r="${innerR - 1}" fill="#ffffff"/></svg>`,
    shares: shares.map((s, i) => ({ ...s, color: colorForIndex(i) })),
  };
}

function computeShares(traits) {
  const total = traits.reduce((sum, t) => sum + Math.max(0, t.normalizedScore), 0) || 1;
  return traits.map((t) => ({
    code: t.code,
    name: t.name,
    score: t.normalizedScore,
    share: (Math.max(0, t.normalizedScore) / total) * 100,
  }));
}

function buildWedge(cx, cy, outerR, innerR, a0, a1, color) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  const d = [
    `M ${p(outerR, a0)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p(outerR, a1)}`,
    `L ${p(innerR, a1)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p(innerR, a0)}`,
    "Z",
  ].join(" ");
  return `<path d="${d}" fill="${color}" />`;
}

module.exports = { buildDonutSvg, computeShares, colorForIndex };
