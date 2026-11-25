const sharp = require('sharp');
const fs = require('fs');

async function finalizePngs() {
  const exact = sharp('public/images/logo-exact.png');
  const meta = await exact.metadata();

  // 1. Copy to public/images/logo.png and logo-dark.png
  fs.copyFileSync('public/images/logo-exact.png', 'public/images/logo.png');
  fs.copyFileSync('public/images/logo-exact.png', 'public/images/logo-dark.png');
  console.log('Saved public/images/logo.png and logo-dark.png');

  // 2. Crop Mark (the two figures heart icon)
  // In 959x313, mark is in left ~249px
  await sharp('public/images/logo-exact.png')
    .extract({ left: 0, top: 0, width: 249, height: meta.height })
    .trim()
    .toFile('public/images/logo-mark.png');

  console.log('Saved public/images/logo-mark.png');
}

finalizePngs();
