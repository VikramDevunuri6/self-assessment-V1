/**
 * Real SVG circular score ring (gradient stroke, rounded cap) -- React
 * port of backend/src/reports/charts/scoreRing.js. Pure geometry from an
 * already-computed 0-100 score; no new math.
 */
export default function ScoreRing({ score, size = 120, stroke = 14, colorFrom = "#0F3DDE", colorTo = "#2CB7F5", trackColor = "#E7ECFB" }) {
  const v = Math.max(0, Math.min(100, score));
  const r = size / 2 - stroke / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (v / 100) * circumference;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scoreRingGradWeb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#scoreRingGradWeb)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash.toFixed(2)} ${circumference.toFixed(2)}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}
