const sharp = require('sharp');

async function measureMark() {
  const { data, info } = await sharp('public/images/premjodo-logo-mark.png').raw().toBuffer({ resolveWithObject: true });
  console.log(`Mark image: ${info.width}x${info.height}`);

  // Let's find rows where alpha > 0
  // Specifically:
  // 1. Where do the heads start and end? (there's a gap between heads and body)
  let headMinY = info.height, headMaxY = 0;
  let bodyMinY = info.height, bodyMaxY = 0;

  // Check row densities
  for (let y = 0; y < info.height; y++) {
    let rowCount = 0;
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 100) rowCount++;
    }
    // console.log(`y=${y}: count=${rowCount}`);
  }

  // Let's find bounding box of left head vs right head
  // Left head is around x < 120, y < 100
  let lhMinX = 250, lhMaxX = 0, lhMinY = 300, lhMaxY = 0;
  let rhMinX = 250, rhMaxX = 0, rhMinY = 300, rhMaxY = 0;

  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 100) {
        if (x < 124) {
          if (x < lhMinX) lhMinX = x;
          if (x > lhMaxX) lhMaxX = x;
          if (y < lhMinY) lhMinY = y;
          if (y > lhMaxY) lhMaxY = y;
        } else {
          if (x < rhMinX) rhMinX = x;
          if (x > rhMaxX) rhMaxX = x;
          if (y < rhMinY) rhMinY = y;
          if (y > rhMaxY) rhMaxY = y;
        }
      }
    }
  }

  console.log(`Left Head: [${lhMinX}, ${lhMinY}] to [${lhMaxX}, ${lhMaxY}] -> width: ${lhMaxX - lhMinX + 1}, height: ${lhMaxY - lhMinY + 1}, center: [${(lhMinX + lhMaxX)/2}, ${(lhMinY + lhMaxY)/2}]`);
  console.log(`Right Head: [${rhMinX}, ${rhMinY}] to [${rhMaxX}, ${rhMaxY}] -> width: ${rhMaxX - rhMinX + 1}, height: ${rhMaxY - rhMinY + 1}, center: [${(rhMinX + rhMaxX)/2}, ${(rhMinY + rhMaxY)/2}]`);

  // Where does body start?
  for (let y = lhMaxY + 1; y < info.height; y++) {
    let hasPixel = false;
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 100) {
        hasPixel = true;
        break;
      }
    }
    if (hasPixel) {
      console.log(`Body starts at y=${y}`);
      break;
    }
  }

  // Check the gap between left and right heart half at several y levels
  for (let y of [140, 180, 220, 260, 300]) {
    let leftHalfMaxX = 0;
    let rightHalfMinX = info.width;
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      const r = data[(y * info.width + x) * 4];
      if (a > 100) {
        if (r > 150) { // Pink
          if (x > leftHalfMaxX) leftHalfMaxX = x;
        } else { // Purple
          if (x < rightHalfMinX) rightHalfMinX = x;
        }
      }
    }
    console.log(`y=${y}: Pink max X = ${leftHalfMaxX}, Purple min X = ${rightHalfMinX}, Gap = ${rightHalfMinX - leftHalfMaxX}`);
  }
}

measureMark();
