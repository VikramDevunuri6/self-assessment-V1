/**
 * Flat-design SVG illustrations -- larger, more detailed than a generic
 * placeholder icon, since they act as visual anchors (per the V2.1 design
 * pass) rather than small decorative filler. Hand-drawn with basic shapes,
 * zero external assets, purely decorative (no data-bearing content).
 */

function avatarIllustration() {
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E9EEFF"/>
        <stop offset="100%" stop-color="#D7E2FF"/>
      </linearGradient>
      <linearGradient id="avatarHoodie" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3D5CF5"/>
        <stop offset="100%" stop-color="#0F3DDE"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="50" fill="url(#avatarBg)"/>
    <path d="M10 92c2-19 14-28 40-28s38 9 40 28c-12 6-26 9-40 9s-28-3-40-9Z" fill="url(#avatarHoodie)"/>
    <path d="M30 68c2-7 8-11 20-11s18 4 20 11l-6 6H36Z" fill="#274BD6"/>
    <circle cx="50" cy="42" r="19" fill="#3A2E28"/>
    <circle cx="50" cy="45" r="16" fill="#F2C29A"/>
    <path d="M34 38c0-11 7.5-18 16-18s16 7 16 18c-4-2-8-7-16-7s-12 5-16 7Z" fill="#3A2E28"/>
    <circle cx="44" cy="46" r="1.7" fill="#33261F"/>
    <circle cx="56" cy="46" r="1.7" fill="#33261F"/>
    <path d="M44 54c2.4 2 9.6 2 12 0" stroke="#B5703F" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle cx="78" cy="20" r="11" fill="#FF8A00"/>
    <path d="M78 14.5v11M72.5 20h11" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

function mountainTrophyIllustration() {
  return `<svg viewBox="0 0 140 110" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mtnBack" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#BFD3FF"/>
        <stop offset="100%" stop-color="#9DB7F5"/>
      </linearGradient>
      <linearGradient id="mtnFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3D5CF5"/>
        <stop offset="100%" stop-color="#0F3DDE"/>
      </linearGradient>
    </defs>
    <circle cx="108" cy="24" r="14" fill="#FFE6B3"/>
    <path d="M4 100 46 32l20 26 11-14 34 56Z" fill="url(#mtnBack)"/>
    <path d="M4 100 52 22l28 38 14-16 28 56Z" fill="url(#mtnFront)"/>
    <path d="M52 22 53.5 6" stroke="#08236B" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M53.5 6 66 10.5 53.5 16Z" fill="#F64C72"/>
    <path d="M40 64h24l-12 14Z" fill="#E9EFFF" opacity="0.85"/>
    <circle cx="22" cy="86" r="2.6" fill="#fff" opacity="0.7"/>
    <circle cx="100" cy="80" r="2" fill="#fff" opacity="0.7"/>
  </svg>`;
}

function growthFlagIllustration() {
  return `<svg viewBox="0 0 140 110" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="stepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#C9B8FA"/>
        <stop offset="100%" stop-color="#9B7CF0"/>
      </linearGradient>
    </defs>
    <rect x="4" y="84" width="30" height="18" rx="3" fill="url(#stepGrad)"/>
    <rect x="30" y="66" width="30" height="36" rx="3" fill="url(#stepGrad)"/>
    <rect x="56" y="48" width="30" height="54" rx="3" fill="url(#stepGrad)"/>
    <rect x="82" y="28" width="30" height="74" rx="3" fill="#7B3FE4"/>
    <path d="M97 28V8" stroke="#4C1D95" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M97 8 115 14 97 20Z" fill="#FF8A00"/>
    <path d="M68 48c-1-9 3-15 9-18-1 7 1 11 5 13-3 5-9 7-14 5Z" fill="#27AE60"/>
    <path d="M77 48v-9" stroke="#15803D" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function finaleTrophyIllustration() {
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE9AD"/>
        <stop offset="100%" stop-color="#FF8A00"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#0F2A6E"/>
    <circle cx="50" cy="50" r="48" fill="none" stroke="#2CB7F5" stroke-width="1.5" opacity="0.5"/>
    <g opacity="0.55" stroke="#FFE9AD" stroke-width="1.4">
      <path d="M50 6v10M50 84v10M6 50h10M84 50h10M18 18l7 7M75 75l7 7M82 18l-7 7M25 75l-7 7"/>
    </g>
    <path d="M34 22h32v14a16 16 0 0 1-32 0V22Z" fill="url(#trophyGold)"/>
    <path d="M34 24h-9v6a10 10 0 0 0 9 10" fill="none" stroke="url(#trophyGold)" stroke-width="3.2"/>
    <path d="M66 24h9v6a10 10 0 0 1-9 10" fill="none" stroke="url(#trophyGold)" stroke-width="3.2"/>
    <rect x="44" y="50" width="12" height="10" fill="url(#trophyGold)"/>
    <path d="M30 68h40l-4 8H34Z" fill="url(#trophyGold)"/>
    <circle cx="50" cy="30" r="4.4" fill="#fff" opacity="0.55"/>
  </svg>`;
}

module.exports = { avatarIllustration, mountainTrophyIllustration, growthFlagIllustration, finaleTrophyIllustration };
