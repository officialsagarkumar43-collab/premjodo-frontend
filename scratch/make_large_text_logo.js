const fs = require('fs');
const sharp = require('sharp');

const markSvgRaw = fs.readFileSync('scratch/exact_mark.svg', 'utf8');
const leftPath = markSvgRaw.match(/<path d="([^"]+)" fill="#dd3d61"/)[1];
const rightPath = markSvgRaw.match(/<path d="([^"]+)" fill="#695ddf"/)[1];

async function makeLargeTextLogo() {
  // Let's set mark height to 220px (scale = 220 / 313 ≈ 0.703)
  // Mark width = 248 * (220/313) ≈ 174px
  const scale = 220 / 313;
  const markW = Math.round(248 * scale);
  const markH = 220;

  // Let's center mark vertically in a 240px canvas (yOffset = 10)
  // And place text: font-size = 215px
  // Capital 'P' will have cap-height ~ 152px!
  // Baseline y = 188
  // Gap between mark and text = 28px
  const textX = markW + 28;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 240" width="1100" height="240" fill="none">
    <!-- Icon Mark (scaled to 220px height) -->
    <g transform="translate(0, 10) scale(${scale})">
      <!-- Left Head -->
      <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
      <!-- Left Body -->
      <path d="${leftPath}" fill="#dd3d61" />

      <!-- Right Head -->
      <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
      <!-- Right Body -->
      <path d="${rightPath}" fill="#695ddf" />
    </g>

    <!-- Wordmark with prominent Capital 'P' and enlarged text -->
    <text x="${textX}" y="178" font-family="'Poppins', 'Outfit', 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="212" font-weight="800" letter-spacing="-0.03em">
      <tspan fill="#dd3d61">Prem</tspan><tspan fill="#695ddf">jodo</tspan>
    </text>
  </svg>`;

  const pngBuffer = await sharp(Buffer.from(svg))
    .trim()
    .png()
    .toBuffer();

  const meta = await sharp(pngBuffer).metadata();
  console.log(`Large text logo trimmed size: ${meta.width}x${meta.height}`);

  fs.writeFileSync('public/images/logo.png', pngBuffer);
  fs.writeFileSync('public/images/logo-dark.png', pngBuffer);
  fs.writeFileSync('public/images/logo.svg', svg);
  fs.writeFileSync('public/images/logo-dark.svg', svg);

  // Let's also create mark only PNG:
  const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 313" width="248" height="313" fill="none">
    <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
    <path d="${leftPath}" fill="#dd3d61" />
    <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
    <path d="${rightPath}" fill="#695ddf" />
  </svg>`;

  const markPng = await sharp(Buffer.from(markSvg))
    .trim()
    .png()
    .toBuffer();

  fs.writeFileSync('public/images/logo-mark.png', markPng);
  fs.writeFileSync('public/images/logo-mark.svg', markSvg);

  console.log('Saved all logo files successfully!');
}

makeLargeTextLogo();
