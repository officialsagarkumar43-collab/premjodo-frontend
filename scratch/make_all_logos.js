const fs = require('fs');
const sharp = require('sharp');

async function makeAllLogos() {
  const markSvg = fs.readFileSync('scratch/exact_mark.svg', 'utf8');

  // Let's get the trimmed full logo PNG from scratch/process_logo.js
  // 'public/images/premjodo-logo-full.png'
  const fullPng = sharp('public/images/premjodo-logo-full.png');
  const fullMeta = await fullPng.metadata();
  console.log('Full logo size:', fullMeta.width, fullMeta.height);

  // 1. Save standard logo.png and logo-dark.png from the transparent PNG
  await fullPng
    .clone()
    .toFile('public/images/logo.png');

  await fullPng
    .clone()
    .toFile('public/images/logo-dark.png');

  console.log('Saved public/images/logo.png and logo-dark.png');

  // 2. Save mark PNG
  const markPng = sharp('public/images/premjodo-logo-mark.png');
  await markPng
    .clone()
    .toFile('public/images/logo-mark.png');
  console.log('Saved public/images/logo-mark.png');

  // 3. Save mark SVG
  fs.writeFileSync('public/images/logo-mark.svg', markSvg);
  console.log('Saved public/images/logo-mark.svg');

  // 4. Create full logo SVG that embeds the vector mark + text
  // Let's check text dimensions and font
  // In the image, text is "premjodo" with height ~ 134, width ~ 591, vertically centered with the mark
  // Mark height is 313. Text y is from 122 to 255 (height 134).
  // Baseline is around y = 230.
  // Font is a clean geometric sans: Poppins, Inter, Outfit, or system-ui sans-serif with font-weight: 600 or 700.
  // We can also embed the transparent text PNG as an image in SVG for 100% exact typeface match, OR use SVG text!
  // Let's create an SVG that uses vector mark and crisp styled text, and also one that uses the exact raster text
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 313" width="960" height="313" fill="none">
  <!-- Mark (width 248, height 313) -->
  <g id="logo-mark">
    <!-- Left Person (Head + Heart Half) -->
    <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
    <path d="${fs.readFileSync('scratch/exact_mark.svg', 'utf8').match(/<path d="([^"]+)" fill="#dd3d61"/)[1]}" fill="#dd3d61" />

    <!-- Right Person (Head + Heart Half) -->
    <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
    <path d="${fs.readFileSync('scratch/exact_mark.svg', 'utf8').match(/<path d="([^"]+)" fill="#695ddf"/)[1]}" fill="#695ddf" />
  </g>

  <!-- Wordmark -->
  <text x="350" y="232" font-family="'Poppins', 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" font-size="142" font-weight="700" letter-spacing="-0.02em">
    <tspan fill="#dd3d61">prem</tspan><tspan fill="#695ddf">jodo</tspan>
  </text>
</svg>`;

  fs.writeFileSync('public/images/logo.svg', logoSvg);
  fs.writeFileSync('public/images/logo-dark.svg', logoSvg);
  console.log('Saved public/images/logo.svg and logo-dark.svg');
}

makeAllLogos();
