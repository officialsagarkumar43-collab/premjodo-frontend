const sharp = require('sharp');

async function cropMark() {
  const full = sharp('public/images/premjodo-logo-full.png');
  const meta = await full.metadata();
  console.log('Full image dimensions:', meta.width, meta.height);

  // In trimmed image, mark starts at 0 and ends around width ~ 249
  // Let's find exact column where mark ends
  const { data, info } = await sharp('public/images/premjodo-logo-full.png').raw().toBuffer({ resolveWithObject: true });

  // Find column with all alpha=0 between mark and text
  let splitCol = 249;
  for (let x = 240; x < 400; x++) {
    let hasPixel = false;
    for (let y = 0; y < info.height; y++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 20) {
        hasPixel = true;
        break;
      }
    }
    if (!hasPixel) {
      splitCol = x;
      break;
    }
  }

  console.log('First empty column after mark:', splitCol);

  // Crop mark
  await sharp('public/images/premjodo-logo-full.png')
    .extract({ left: 0, top: 0, width: splitCol, height: info.height })
    .trim()
    .toFile('public/images/premjodo-logo-mark.png');

  const markMeta = await sharp('public/images/premjodo-logo-mark.png').metadata();
  console.log('Cropped Mark dimensions:', markMeta.width, markMeta.height);

  // Crop text
  await sharp('public/images/premjodo-logo-full.png')
    .extract({ left: splitCol, top: 0, width: info.width - splitCol, height: info.height })
    .trim()
    .toFile('public/images/premjodo-logo-text.png');

  const textMeta = await sharp('public/images/premjodo-logo-text.png').metadata();
  console.log('Cropped Text dimensions:', textMeta.width, textMeta.height);
}

cropMark();
