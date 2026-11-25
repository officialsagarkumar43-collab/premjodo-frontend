const sharp = require('sharp');

async function checkColors() {
  const { data, info } = await sharp('public/images/premjodo-logo-mark.png').raw().toBuffer({ resolveWithObject: true });
  // Sample at y=200, x=50 (left body)
  const idxL = (200 * info.width + 50) * 4;
  console.log('Left body (50, 200):', data[idxL], data[idxL+1], data[idxL+2], data[idxL+3]);

  // Sample at y=200, x=180 (right body)
  const idxR = (200 * info.width + 180) * 4;
  console.log('Right body (180, 200):', data[idxR], data[idxR+1], data[idxR+2], data[idxR+3]);

  // Check the vertical boundary line between left and right half across y
  console.log('Boundary line at y=150:');
  for (let x = 110; x <= 135; x++) {
    const idx = (150 * info.width + x) * 4;
    console.log(`x=${x}: R=${data[idx]} G=${data[idx+1]} B=${data[idx+2]} A=${data[idx+3]}`);
  }
}

checkColors();
