const sharp = require('sharp');
const fs = require('fs');

async function traceContours() {
  const { data, info } = await sharp('public/images/premjodo-logo-mark.png').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's find the outline points for:
  // 1. Left head (circle)
  // 2. Right head (circle)
  // 3. Left heart half
  // 4. Right heart half

  // Let's inspect Left Head:
  let lhPoints = [];
  for (let y = 0; y < 100; y++) {
    let minX = -1, maxX = -1;
    for (let x = 0; x < 120; x++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1) {
      lhPoints.push({ y, minX, maxX, cx: (minX + maxX) / 2, r: (maxX - minX + 1) / 2 });
    }
  }

  const avgLHCX = lhPoints.reduce((s, p) => s + p.cx, 0) / lhPoints.length;
  const maxLHR = Math.max(...lhPoints.map(p => p.r));
  const minLHY = lhPoints[0].y;
  const maxLHY = lhPoints[lhPoints.length - 1].y;
  const midLHY = (minLHY + maxLHY) / 2;

  console.log(`Left Head: center x=${avgLHCX.toFixed(2)}, y=${midLHY.toFixed(2)}, radius=${maxLHR.toFixed(2)} (height=${maxLHY - minLHY + 1}, width=${maxLHR*2})`);

  // Let's inspect Right Head:
  let rhPoints = [];
  for (let y = 0; y < 100; y++) {
    let minX = -1, maxX = -1;
    for (let x = 125; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1) {
      rhPoints.push({ y, minX, maxX, cx: (minX + maxX) / 2, r: (maxX - minX + 1) / 2 });
    }
  }

  const avgRHCX = rhPoints.reduce((s, p) => s + p.cx, 0) / rhPoints.length;
  const maxRHR = Math.max(...rhPoints.map(p => p.r));
  const minRHY = rhPoints[0].y;
  const maxRHY = rhPoints[rhPoints.length - 1].y;
  const midRHY = (minRHY + maxRHY) / 2;

  console.log(`Right Head: center x=${avgRHCX.toFixed(2)}, y=${midRHY.toFixed(2)}, radius=${maxRHR.toFixed(2)}`);

  // Left Body (pink):
  // Let's sample minX and maxX for each y from 100 to h-1
  console.log('Left Body key profile points (y, minX, maxX):');
  for (let y = 100; y < h; y += 15) {
    let minX = -1, maxX = -1;
    for (let x = 0; x <= 120; x++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1) {
      console.log(`y=${y}: minX=${minX}, maxX=${maxX}`);
    }
  }

  // Right Body (purple):
  console.log('Right Body key profile points (y, minX, maxX):');
  for (let y = 100; y < h; y += 15) {
    let minX = -1, maxX = -1;
    for (let x = 125; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 120) {
        if (minX === -1) minX = x;
        maxX = x;
      }
    }
    if (minX !== -1) {
      console.log(`y=${y}: minX=${minX}, maxX=${maxX}`);
    }
  }
}

traceContours();
