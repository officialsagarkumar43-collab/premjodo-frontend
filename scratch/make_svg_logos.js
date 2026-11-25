const fs = require('fs');

function getLogoSvg(isDark = false) {
  const textColor = isDark ? '#ffffff' : '#241a20';
  const dotColor = '#e11d48';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 44" width="210" height="44" fill="none">
  <defs>
    <!-- Left Loop Theme Gradient (Deep Wine to Rose) -->
    <linearGradient id="pj-loop-l-${isDark ? 'd' : 'l'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#be123c" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>

    <!-- Right Loop Theme Gradient (Rose to Warm Pink/Coral) -->
    <linearGradient id="pj-loop-r-${isDark ? 'd' : 'l'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fb7185" />
    </linearGradient>

    <!-- Center Circle Medallion Gradient -->
    <linearGradient id="pj-circle-${isDark ? 'd' : 'l'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#9f1239" />
    </linearGradient>

    <!-- Subtle Glow for Dark Mode -->
    ${isDark ? `
    <filter id="pj-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#e11d48" flood-opacity="0.35" />
    </filter>
    ` : ''}
  </defs>

  <!-- Infinity Heart Mark -->
  <g transform="translate(2, 2)" ${isDark ? 'filter="url(#pj-glow)"' : ''}>
    <!-- Left Loop -->
    <path
      d="M 38,20 C 27,6 6,6 6,20 C 6,34 27,34 38,20 Z"
      stroke="url(#pj-loop-l-${isDark ? 'd' : 'l'})"
      stroke-width="5.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- Right Loop -->
    <path
      d="M 38,20 C 49,6 70,6 70,20 C 70,34 49,34 38,20 Z"
      stroke="url(#pj-loop-r-${isDark ? 'd' : 'l'})"
      stroke-width="5.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- Center Circle Badge -->
    <circle cx="38" cy="20" r="10.5" fill="url(#pj-circle-${isDark ? 'd' : 'l'})" />

    <!-- Center White Heart -->
    <path
      d="M 38,24.8 C 37.2,24 33.6,20.4 33.6,17.8 C 33.6,15.7 35.2,14.1 37,14.1 C 37.7,14.1 38,14.5 38,14.5 C 38,14.5 38.3,14.1 39,14.1 C 40.8,14.1 42.4,15.7 42.4,17.8 C 42.4,20.4 38.8,24 38,24.8 Z"
      fill="#ffffff"
    />
  </g>

  <!-- Wordmark: premjodo. -->
  <text
    x="84"
    y="28"
    font-family="'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="22"
    font-weight="800"
    letter-spacing="-0.5px"
    fill="${textColor}"
  >premjodo<tspan fill="${dotColor}">.</tspan></text>
</svg>`;
}

fs.writeFileSync('public/images/logo.svg', getLogoSvg(false));
fs.writeFileSync('public/images/logo-dark.svg', getLogoSvg(true));
console.log('Generated public/images/logo.svg and public/images/logo-dark.svg');
