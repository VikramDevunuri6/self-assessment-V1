/**
 * Hand-built SVG circular score ring (gradient stroke, rounded cap) -- a
 * real <svg> arc, not a CSS conic-gradient -- so it renders identically
 * across Puppeteer/Chromium and matches the "SVG circular score ring"
 * requirement literally. Pure geometry from an already-computed 0-100
 * score; no new math beyond converting a percentage to an arc length.
 */
function buildScoreRingSvg(pct, { size = 130, stroke = 12, colorFrom = "#0F3DDE", colorTo = "#2CB7F5", trackColor = "#E7ECFB", gradId = "scoreRingGrad" } = {}) {
  const v = Math.max(0, Math.min(100, pct));
  const r = size / 2 - stroke / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (v / 100) * circumference;

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorFrom}"/>
        <stop offset="100%" stop-color="${colorTo}"/>
      </linearGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#${gradId})" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${circumference.toFixed(2)}"
      transform="rotate(-90 ${cx} ${cy})"/>
  </svg>`;
}

module.exports = { buildScoreRingSvg };
