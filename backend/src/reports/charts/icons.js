/**
 * Small inline-SVG icon set for the Puppeteer-rendered executive report.
 * Hand-drawn (not a copied icon library) so the HTML template has zero
 * external asset dependencies -- each icon is a 24x24 stroke glyph that
 * inherits `currentColor`, wrapped in a colored circular badge by callers.
 */
function svg(inner) {
  return `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const ICONS = {
  trophy: svg(
    '<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M10 14v3"/><path d="M14 14v3"/><path d="M8 20h8"/><path d="M9 20v-2.5"/><path d="M15 20v-2.5"/>'
  ),
  target: svg(
    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>'
  ),
  trendUp: svg('<path d="M4 16 10 9l4 3 6-7"/><path d="M16 5h4v4"/>'),
  brain: svg(
    '<path d="M9 4.5c-2 0-3.4 1.5-3.4 3.2 0 .6.2 1.1.4 1.6-1.3.5-2 1.7-2 3 0 1.6 1.2 2.8 2.7 3-0.1.4-.2.8-.2 1.2 0 1.9 1.6 3.3 3.5 3.3"/><path d="M15 4.5c2 0 3.4 1.5 3.4 3.2 0 .6-.2 1.1-.4 1.6 1.3.5 2 1.7 2 3 0 1.6-1.2 2.8-2.7 3 .1.4.2.8.2 1.2 0 1.9-1.6 3.3-3.5 3.3"/><path d="M12 4.5v16"/>'
  ),
  lightbulb: svg(
    '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.3V16h6v-.9c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3Z"/>'
  ),
  users: svg(
    '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M15.5 14.2c2.3.3 4.5 1.8 4.5 4.3"/>'
  ),
  rocket: svg(
    '<path d="M12 3c2.8 1 4.7 3.8 4.7 7.5 0 2.3-.9 4.7-2 6.2l-2.7 3-2.7-3c-1.1-1.5-2-3.9-2-6.2C7.3 6.8 9.2 4 12 3Z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 16.5 6.5 19l-.7 2.5 2.5-.7 1-1.5"/><path d="M15 16.5l2.5 2.5.7 2.5-2.5-.7-1-1.5"/>'
  ),
  book: svg(
    '<path d="M4 5.5C5.5 4.6 7.5 4 9.5 4c1 0 2 .2 2.5.6v13.4c-.5-.4-1.5-.6-2.5-.6-2 0-4 .6-5.5 1.5V5.5Z"/><path d="M20 5.5C18.5 4.6 16.5 4 14.5 4c-1 0-2 .2-2.5.6v13.4c.5-.4 1.5-.6 2.5-.6 2 0 4 .6 5.5 1.5V5.5Z"/>'
  ),
  briefcase: svg(
    '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/><path d="M10.5 12.5h3v1.6h-3z" fill="currentColor"/>'
  ),
  barChart: svg('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>'),
  heart: svg(
    '<path d="M12 20.5S3.5 15.6 3.5 9.6C3.5 6.7 5.7 4.5 8.5 4.5c1.7 0 3.1.9 3.9 2.2.8-1.3 2.2-2.2 3.9-2.2 2.8 0 5.1 2.2 5.1 5.1 0 6-9 10.9-9 10.9Z"/>'
  ),
  compass: svg(
    '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z"/>'
  ),
  calendar: svg(
    '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17"/><path d="M8 3v4"/><path d="M16 3v4"/>'
  ),
  checkCircle: svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.3 11 14.8l5-5.6"/>'),
  flag: svg('<path d="M6 21V4"/><path d="M6 4.5c1.4-1 4-1 6 0s4.6 1 6 0v9c-1.4 1-4 1-6 0s-4.6-1-6 0"/>'),
  graduationCap: svg(
    '<path d="M2 8.5 12 4l10 4.5-10 4.5L2 8.5Z"/><path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11"/><path d="M21 9v5.5"/>'
  ),
  messageCircle: svg(
    '<path d="M21 11.5a8.5 8.5 0 1 1-3.8-7.1L21 3l-1.1 3.7c.7 1.2 1.1 2.5 1.1 4.8Z"/>'
  ),
  sparkles: svg(
    '<path d="M11 3 12.4 7 16 8.4 12.4 9.8 11 14 9.6 9.8 6 8.4 9.6 7 11 3Z"/><path d="M18 14l.9 2.4L21 17.3l-2.1.9L18 20.6l-.9-2.4-2.1-.9 2.1-.9.9-2.4Z"/>'
  ),
  qrCode: svg(
    '<rect x="3.5" y="3.5" width="6" height="6" rx="0.6"/><rect x="14.5" y="3.5" width="6" height="6" rx="0.6"/><rect x="3.5" y="14.5" width="6" height="6" rx="0.6"/><path d="M15 15h2.2v2.2H15Z" fill="currentColor"/><path d="M18.5 15h2v2H18.5Z" fill="currentColor"/><path d="M15 18.5h2v2H15Z" fill="currentColor"/><path d="M18.7 18.7h1.8v1.8h-1.8Z" fill="currentColor"/>'
  ),
  phone: svg(
    '<path d="M5 4.5h3.2l1.3 4-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 4 1.3V18a1.5 1.5 0 0 1-1.6 1.5C10.6 19 5 13.4 4.5 6.1A1.5 1.5 0 0 1 5 4.5Z"/>'
  ),
  mail: svg('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>'),
  globe: svg(
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9s1.3-6.6 3.8-9Z"/>'
  ),
  shieldCheck: svg(
    '<path d="M12 3.5 19 6.5v5c0 5-3 8-7 9.5-4-1.5-7-4.5-7-9.5v-5L12 3.5Z"/><path d="M9 12l2.2 2.2L15.5 9.6"/>'
  ),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  layers: svg(
    '<path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z"/><path d="M3 12l9 4.5L21 12"/><path d="M3 16l9 4.5L21 16"/>'
  ),
  puzzle: svg(
    '<path d="M9 4.5h3.2a1.6 1.6 0 0 1 1.6 2.7c-.6.5-.6 1.4 0 1.9.6.5 1.5.5 2.1 0a1.6 1.6 0 0 1 2.6 1.3V13h-2.2c-1 0-1.8.9-1.5 1.9.1.5.5.9.9 1.1.8.4 1.3 1.2 1.3 2.1A1.9 1.9 0 0 1 15.1 20H4.5V9.4a1.6 1.6 0 0 1 2.7-1.6c.5.6 1.4.6 1.9 0 .5-.6.5-1.5 0-2.1A1.6 1.6 0 0 1 9 4.5Z"/>'
  ),
  userCircle: svg(
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.2 18c.9-2.3 3-3.6 5.8-3.6s4.9 1.3 5.8 3.6"/>'
  ),
  code: svg('<path d="M9.5 6.5 4.5 12l5 5.5"/><path d="M14.5 6.5 19.5 12l-5 5.5"/>'),
  star: svg(
    '<path d="M12 3.5 14.6 9 20.5 9.8l-4.3 4 1 5.8L12 16.8 6.8 19.6l1-5.8-4.3-4L9.4 9Z" fill="currentColor"/>'
  ),
};

function icon(name) {
  return ICONS[name] || ICONS.sparkles;
}

module.exports = { icon };
