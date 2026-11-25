const sharp = require('sharp');
const fs = require('fs');

async function extractHeartHalfPath() {
  const { data, info } = await sharp('public/images/premjodo-logo-mark.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's get outer boundary points for left body from y=100 to y=312
  const outerPoints = [];
  for (let y = 100; y <= 312; y += 2) {
    let minX = -1;
    for (let x = 0; x <= 118; x++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        minX = x;
        break;
      }
    }
    if (minX !== -1) outerPoints.push({ x: minX, y });
  }

  // Also top curve from minX (at y=145, minX=0) going up to top lobe
  // Let's get top lobe points (x from 0 to 118, finding minY for each x)
  const topPoints = [];
  for (let x = 0; x <= 118; x += 2) {
    let minY = -1;
    for (let y = 90; y <= 160; y++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        minY = y;
        break;
      }
    }
    if (minY !== -1) topPoints.push({ x, y: minY });
  }

  console.log('Top points sample:', topPoints.filter((_, i) => i % 5 === 0));
  console.log('Outer points sample:', outerPoints.filter((_, i) => i % 8 === 0));
}

extractHeartHalfPath();
