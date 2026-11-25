const sharp = require('sharp');

async function checkHeadShape() {
  const { data, info } = await sharp('public/images/premjodo-logo-mark.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  for (let y = 0; y < 100; y += 10) {
    let minX = -1, maxX = -1;
    for (let x = 0; x < 120; x++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    console.log(`y=${y}: x in [${minX}, ${maxX}] (width=${maxX - minX + 1})`);
  }
}

checkHeadShape();
