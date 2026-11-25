const fs = require('fs');
const sharp = require('sharp');

// Let's build a smooth SVG path for the left half:
// Start at (118, 312)
// Line to (118, 120) - inner vertical line
// Curve up-left to top of lobe (around 52, 92): C 118,104 88,92 52,92
// Curve down-left to outer edge (0, 150): C 20,92 0,116 0,150
// Curve down-right to bottom tip (118, 312): C 0,210 58,270 118,312
// Z

// Let's test this SVG and refine control points to match the exact silhouette
function getSvg(c1, c2, c3, c4, c5, c6) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 313" width="248" height="313">
    <!-- Left Person Head -->
    <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
    
    <!-- Left Person Body (Left Heart Half) -->
    <path d="M 118,312 L 118,120 C 118,104 88,92 52,92 C 22,92 0,116 0,150 C 0,208 55,268 118,312 Z" fill="#dd3d61" />
    
    <!-- Right Person Head -->
    <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
    
    <!-- Right Person Body (Right Heart Half) - Exact reflection -->
    <path d="M 129,312 L 129,120 C 129,104 159,92 195,92 C 225,92 247,116 247,150 C 247,208 192,268 129,312 Z" fill="#695ddf" />
  </svg>`;
}

async function testSvg() {
  const svg = getSvg();
  fs.writeFileSync('scratch/test_mark.svg', svg);
  const rendered = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true });
  const original = await sharp('public/images/premjodo-logo-mark.png').resize(248, 313).raw().toBuffer({ resolveWithObject: true });

  let diffPixels = 0;
  for (let i = 0; i < rendered.data.length; i += 4) {
    const a1 = rendered.data[i+3];
    const a2 = original.data[i+3];
    if (Math.abs(a1 - a2) > 60) diffPixels++;
  }
  console.log(`Diff pixels count: ${diffPixels} out of ${248*313} (${((diffPixels / (248*313)) * 100).toFixed(2)}%)`);
}

testSvg();
