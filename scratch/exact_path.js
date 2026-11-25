const fs = require('fs');
const sharp = require('sharp');

// Let's trace the exact boundary of the left heart half from the original PNG
// to build the exact SVG path (smooth polygon / path)
async function getExactPath() {
  const { data, info } = await sharp('public/images/premjodo-logo-mark.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's trace the outer boundary:
  // 1. Right side of left half: (118, 312) to (118, 120) - straight line
  // 2. Top dip and curve: from (118, 120) up and over the lobe to (0, 150)
  // 3. Left curve: from (0, 150) down to (118, 312)

  // Let's collect boundary points at 1px y steps
  const leftContour = [];
  // Go from bottom (118, 312) up to (118, 120)
  leftContour.push({ x: 118, y: 312 });
  leftContour.push({ x: 118, y: 120 });

  // Now trace top edge from x=118 down to x=0
  for (let x = 117; x >= 0; x -= 2) {
    let topY = -1;
    for (let y = 80; y <= 160; y++) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        topY = y;
        break;
      }
    }
    if (topY !== -1) leftContour.push({ x, y: topY });
  }

  // Now trace left outer edge from y at x=0 down to y=312
  for (let y = 152; y <= 312; y += 3) {
    let outerX = -1;
    for (let x = 0; x <= 118; x++) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        outerX = x;
        break;
      }
    }
    if (outerX !== -1) leftContour.push({ x: outerX, y });
  }
  leftContour.push({ x: 118, y: 312 });

  // Simplify or build SVG path `d="..."`
  const pathD = leftContour.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // Build right half by mirroring x' = 247 - x
  const rightPathD = leftContour.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(247 - p.x).toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 313" width="248" height="313">
  <!-- Left Head -->
  <circle cx="51.5" cy="33.5" r="33.5" fill="#dd3d61" />
  <!-- Left Body -->
  <path d="${pathD}" fill="#dd3d61" />
  
  <!-- Right Head -->
  <circle cx="195.5" cy="33.5" r="33.5" fill="#695ddf" />
  <!-- Right Body -->
  <path d="${rightPathD}" fill="#695ddf" />
</svg>`;

  fs.writeFileSync('scratch/exact_mark.svg', fullSvg);

  const rendered = await sharp(Buffer.from(fullSvg)).raw().toBuffer({ resolveWithObject: true });
  const original = await sharp('public/images/premjodo-logo-mark.png').resize(248, 313).raw().toBuffer({ resolveWithObject: true });

  let diff = 0;
  for (let i = 0; i < rendered.data.length; i += 4) {
    if (Math.abs(rendered.data[i+3] - original.data[i+3]) > 60) diff++;
  }
  console.log(`Exact polygon diff pixels: ${diff} (${((diff / (248*313)) * 100).toFixed(2)}%)`);
}

getExactPath();
