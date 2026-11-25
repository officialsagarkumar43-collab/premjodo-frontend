const sharp = require('sharp');

async function checkText() {
  const { data, info } = await sharp('public/images/premjodo-logo-text.png').raw().toBuffer({ resolveWithObject: true });
  console.log(`Text dimensions: ${info.width}x${info.height}`);

  // Let's sample across horizontal slice around the middle of text (y = 190)
  for (let x = 0; x < info.width; x += 30) {
    const idx = (190 * info.width + x) * 4;
    const a = data[idx+3];
    if (a > 50) {
      const hex = '#' + [data[idx], data[idx+1], data[idx+2]].map(v => v.toString(16).padStart(2, '0')).join('');
      console.log(`x=${x}, y=190: ${hex}`);
    }
  }
}

checkText();
