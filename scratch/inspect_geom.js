const sharp = require('sharp');

async function inspectGeometry() {
  const imgPath = 'C:/Users/adars/.gemini/antigravity/brain/9e49b4a0-07ef-4637-9b9b-e0a044c6f1e2/.user_uploaded/media_1795534996013_80f6ecb4.png';
  const img = sharp(imgPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // Let's find bounding box of non-background pixels (where diff from #191919 > threshold)
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  // Also track mark (x < 350) and text (x >= 350)
  let markMinX = info.width, markMaxX = 0, markMinY = info.height, markMaxY = 0;
  let textMinX = info.width, textMaxX = 0, textMinY = info.height, textMaxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const dist = Math.abs(r - 0x19) + Math.abs(g - 0x19) + Math.abs(b - 0x19);
      if (dist > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        if (x < 350) {
          if (x < markMinX) markMinX = x;
          if (x > markMaxX) markMaxX = x;
          if (y < markMinY) markMinY = y;
          if (y > markMaxY) markMaxY = y;
        } else {
          if (x < textMinX) textMinX = x;
          if (x > textMaxX) textMaxX = x;
          if (y < textMinY) textMinY = y;
          if (y > textMaxY) textMaxY = y;
        }
      }
    }
  }

  console.log(`Mark bounds: [${markMinX}, ${markMinY}] to [${markMaxX}, ${markMaxY}] (size: ${markMaxX - markMinX + 1}x${markMaxY - markMinY + 1})`);
  console.log(`Text bounds: [${textMinX}, ${textMinY}] to [${textMaxX}, ${textMaxY}] (size: ${textMaxX - textMinX + 1}x${textMaxY - textMinY + 1})`);

  // Let's inspect the vertical center line between the two heart halves around x = (markMinX + markMaxX) / 2
  const midX = Math.round((markMinX + markMaxX) / 2);
  console.log('Estimated Mark Mid X:', midX);

  // Check columns around midX at y=200
  for (let x = midX - 5; x <= midX + 5; x++) {
    const idx = (200 * info.width + x) * info.channels;
    const hex = '#' + [data[idx], data[idx+1], data[idx+2]].map(v => v.toString(16).padStart(2, '0')).join('');
    console.log(`x=${x}, y=200: ${hex}`);
  }
}

inspectGeometry();
