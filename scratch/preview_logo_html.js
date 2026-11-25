const fs = require('fs');

const svgMarkup = (isDark = true) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 56" width="250" height="56" fill="none">
  <defs>
    <!-- Left Loop Gradient: Deep Rose to Vibrant Pink -->
    <linearGradient id="pj-loop-grad-${isDark ? 'dark' : 'light'}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#be123c" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>

    <!-- Center Circle Gradient -->
    <linearGradient id="pj-circle-grad-${isDark ? 'dark' : 'light'}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
  </defs>

  <!-- Group for Infinity Heart Icon (viewBox 0 0 100 50 scaled to fit 56px height) -->
  <g transform="translate(4, 3) scale(1)">
    <!-- Infinity Path -->
    <path
      d="M 50,25 C 36,9 9,9 9,25 C 9,41 36,41 50,25 C 64,9 91,9 91,25 C 91,41 64,41 50,25 Z"
      stroke="url(#pj-loop-grad-${isDark ? 'dark' : 'light'})"
      stroke-width="7.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- Center Circle -->
    <circle cx="50" cy="25" r="13" fill="url(#pj-circle-grad-${isDark ? 'dark' : 'light'})" />

    <!-- Center White Heart -->
    <path
      d="M 50,30.8 C 49,29.8 44.5,25.2 44.5,22 C 44.5,19.4 46.5,17.4 48.8,17.4 C 49.6,17.4 50,17.9 50,17.9 C 50,17.9 50.4,17.4 51.2,17.4 C 53.5,17.4 55.5,19.4 55.5,22 C 55.5,25.2 51,29.8 50,30.8 Z"
      fill="#ffffff"
    />
  </g>

  <!-- Wordmark Text: premjodo. -->
  <text
    x="112"
    y="34"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="28"
    font-weight="800"
    letter-spacing="-0.8px"
    fill="${isDark ? '#ffffff' : '#241a20'}"
  >premjodo<tspan fill="#e11d48">.</tspan></text>
</svg>
`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; display: flex; gap: 40px; padding: 50px; background: #888; }
    .box { padding: 40px; border-radius: 20px; }
    .dark { background: #181116; }
    .light { background: #ffffff; }
  </style>
</head>
<body>
  <div class="box dark">
    <h3 style="color:#aaa;">Dark Mode:</h3>
    ${svgMarkup(true)}
  </div>
  <div class="box light">
    <h3 style="color:#444;">Light Mode:</h3>
    ${svgMarkup(false)}
  </div>
</body>
</html>
`;

fs.writeFileSync('scratch/preview_logo.html', html);
console.log('Saved scratch/preview_logo.html');
