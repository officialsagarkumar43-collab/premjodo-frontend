const fs = require('fs');
const sharp = require('sharp');

const markSvgRaw = fs.readFileSync('scratch/exact_mark.svg', 'utf8');
const leftPath = markSvgRaw.match(/<path d="([^"]+)" fill="#dd3d61"/)[1];
const rightPath = markSvgRaw.match(/<path d="([^"]+)" fill="#695ddf"/)[1];

async function fixClippedLogo() {
  const scale = 220 / 313;
  const markW = Math.round(248 * scale); // ~174px

  // Give generous canvas width (1500) so "o" has plenty of room and will NEVER be cut off
  const textX = markW + 28;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 240" width="1500" height="240" fill="none">
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

  // Convert to PNG, trim transparent edges
  const pngBuffer = await sharp(Buffer.from(svg))
    .trim()
    .png()
    .toBuffer();

  const meta = await sharp(pngBuffer).metadata();
  console.log(`Trimmed size without clipping: ${meta.width}x${meta.height}`);

  // Let's add 6px padding on right and left so it breathes cleanly
  const padded = await sharp(pngBuffer)
    .extend({
      top: 4,
      bottom: 4,
      left: 4,
      right: 12,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const finalMeta = await sharp(padded).metadata();
  console.log(`Final logo dimensions: ${finalMeta.width}x${finalMeta.height}`);

  fs.writeFileSync('public/images/logo.png', padded);
  fs.writeFileSync('public/images/logo-dark.png', padded);

  // Update SVG as well with exact trimmed dimensions
  const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${finalMeta.width} ${finalMeta.height}" width="${finalMeta.width}" height="${finalMeta.height}" fill="none">
    <g transform="translate(4, 4)">
      <g transform="translate(0, 10) scale(${scale})">
        <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
        <path d="${leftPath}" fill="#dd3d61" />
        <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
        <path d="${rightPath}" fill="#695ddf" />
      </g>
      <text x="${textX}" y="178" font-family="'Poppins', 'Outfit', 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="212" font-weight="800" letter-spacing="-0.03em">
        <tspan fill="#dd3d61">Prem</tspan><tspan fill="#695ddf">jodo</tspan>
      </text>
    </g>
  </svg>`;

  fs.writeFileSync('public/images/logo.svg', finalSvg);
  fs.writeFileSync('public/images/logo-dark.svg', finalSvg);

  console.log('Saved non-clipped logo PNGs and SVGs successfully!');
}

fixClippedLogo();
