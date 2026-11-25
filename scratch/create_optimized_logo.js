const fs = require('fs');
const sharp = require('sharp');

const markSvgRaw = fs.readFileSync('scratch/exact_mark.svg', 'utf8');
const leftPath = markSvgRaw.match(/<path d="([^"]+)" fill="#dd3d61"/)[1];
const rightPath = markSvgRaw.match(/<path d="([^"]+)" fill="#695ddf"/)[1];

async function createOptimizedLogo() {
  // We want:
  // 1. Mark: 248 x 313
  // 2. Text: "Premjodo" with Capital 'P', using bold weight and large font-size
  // If Mark is 260px high (scale 260/313 = 0.83), width is 206px.
  // Text cap-height for 'P': font-size = 195px, cap-height ~ 145px (x-height ~ 105px).
  // Total canvas height: 260px.
  // This makes the text much larger and visually prominent!

  // Let's create an SVG with exact positioning
  // Mark is vertically centered with the text
  // Text baseline around y = 195 (with font-size 195, cap P goes from ~50 to 195)
  const scale = 260 / 313;
  const markW = Math.round(248 * scale);
  const markH = 260;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 260" width="1050" height="260" fill="none">
    <!-- Icon Mark (scaled to 260px height) -->
    <g transform="scale(${scale})">
      <!-- Left Head -->
      <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
      <!-- Left Body -->
      <path d="${leftPath}" fill="#dd3d61" />

      <!-- Right Head -->
      <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
      <!-- Right Body -->
      <path d="${rightPath}" fill="#695ddf" />
    </g>

    <!-- Wordmark with Capital 'P' and enlarged size -->
    <text x="${markW + 35}" y="196" font-family="'Poppins', 'Outfit', 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="192" font-weight="800" letter-spacing="-0.03em">
      <tspan fill="#dd3d61">Prem</tspan><tspan fill="#695ddf">jodo</tspan>
    </text>
  </svg>`;

  fs.writeFileSync('scratch/logo-optimized.svg', svg);

  const pngBuffer = await sharp(Buffer.from(svg))
    .trim()
    .png()
    .toBuffer();

  const meta = await sharp(pngBuffer).metadata();
  console.log(`Trimmed optimized dimensions: ${meta.width}x${meta.height}`);

  fs.writeFileSync('public/images/logo.png', pngBuffer);
  fs.writeFileSync('public/images/logo-dark.png', pngBuffer);
  fs.writeFileSync('public/images/logo.svg', svg);
  fs.writeFileSync('public/images/logo-dark.svg', svg);

  console.log('Successfully written to public/images/logo.png and logo-dark.png');
}

createOptimizedLogo();
