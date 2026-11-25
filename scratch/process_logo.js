const sharp = require('sharp');
const fs = require('fs');

async function processLogo() {
  const imgPath = 'C:/Users/adars/.gemini/antigravity/brain/9e49b4a0-07ef-4637-9b9b-e0a044c6f1e2/.user_uploaded/media_1795534996013_80f6ecb4.png';
  const img = sharp(imgPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // Background color is #191919 (r: 25, g: 25, b: 25)
  const bgR = 25, bgG = 25, bgB = 25;

  // Let's create an RGBA buffer with transparent background
  // For each pixel, compute alpha based on difference from background
  const rgba = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(dr*dr + dg*dg + db*db);

    if (dist < 4) {
      // background
      rgba[j] = 0;
      rgba[j+1] = 0;
      rgba[j+2] = 0;
      rgba[j+3] = 0;
    } else {
      // un-multiply against dark background for smooth anti-aliased edge
      // Color C_actual = C_foreground * alpha + C_bg * (1 - alpha)
      // For saturated pink/purple, let's estimate alpha
      let alpha = Math.min(1, dist / 18);
      // For pixels close to full color:
      if (dist > 35) alpha = 1.0;

      rgba[j] = r;
      rgba[j+1] = g;
      rgba[j+2] = b;
      rgba[j+3] = Math.round(alpha * 255);
    }
  }

  // Save transparent full logo
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile('public/images/premjodo-logo-full.png');

  console.log('Saved public/images/premjodo-logo-full.png');

  // Also crop just the mark
  const trimmedMeta = await sharp('public/images/premjodo-logo-full.png').metadata();
  console.log('Trimmed size:', trimmedMeta.width, trimmedMeta.height);
}

processLogo();
