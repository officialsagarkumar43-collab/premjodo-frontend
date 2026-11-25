const fs = require('fs');
const sharp = require('sharp');

// Let's create high-res versions with Capital 'P': "Prem" in #dd3d61 and "jodo" in #695ddf
// We want the text to be significantly larger and well-balanced with the mark.

// Mark path from exact_mark.svg:
const markSvgRaw = fs.readFileSync('scratch/exact_mark.svg', 'utf8');
const leftPath = markSvgRaw.match(/<path d="([^"]+)" fill="#dd3d61"/)[1];
const rightPath = markSvgRaw.match(/<path d="([^"]+)" fill="#695ddf"/)[1];

async function generateBalancedLogo() {
  // Mark native dimensions: viewBox 0 0 248 313
  // Let's create an SVG canvas:
  // If Mark height is 240 (scaled from 313 by factor 240/313 = 0.766, so width is ~190)
  // Or keep mark at 313, and make font-size: 210, so capital 'P' has cap-height ~ 150-160px!
  // In the previous image, font-size was only 142 and lowercase 'p' x-height was only ~90px.
  // With capital 'P' and font-size ~ 210-220, the text will be nice, prominent, and legible!

  // Let's test a few font families and sizes:
  // Using clean geometric sans: Poppins, Outfit, Inter, system-ui
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1150 320" width="1150" height="320" fill="none">
    <!-- Icon Mark (y: 3.5 to 316.5) -->
    <g transform="translate(10, 3.5)">
      <!-- Left Head -->
      <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
      <!-- Left Body -->
      <path d="${leftPath}" fill="#dd3d61" />

      <!-- Right Head -->
      <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
      <!-- Right Body -->
      <path d="${rightPath}" fill="#695ddf" />
    </g>

    <!-- Wordmark with Capital 'P' and larger size -->
    <text x="310" y="222" font-family="'Poppins', 'Outfit', 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="190" font-weight="800" letter-spacing="-0.03em">
      <tspan fill="#dd3d61">P</tspan><tspan fill="#dd3d61">rem</tspan><tspan fill="#695ddf">jodo</tspan>
    </text>
  </svg>`;

  fs.writeFileSync('scratch/logo-cap-p.svg', svg);

  // Rasterize to high-res PNG and trim excess transparent padding
  const trimmedPng = await sharp(Buffer.from(svg))
    .trim()
    .png()
    .toBuffer();

  const meta = await sharp(trimmedPng).metadata();
  console.log(`Trimmed logo dimensions: ${meta.width}x${meta.height}`);

  fs.writeFileSync('public/images/logo.png', trimmedPng);
  fs.writeFileSync('public/images/logo-dark.png', trimmedPng);
  fs.writeFileSync('public/images/logo.svg', svg);
  fs.writeFileSync('public/images/logo-dark.svg', svg);

  console.log('Saved public/images/logo.png, logo-dark.png, logo.svg, logo-dark.svg');
}

generateBalancedLogo();
