const sharp = require('sharp');

async function inspectRendered() {
  const { data, info } = await sharp('public/images/logo.png').raw().toBuffer({ resolveWithObject: true });
  console.log(`info: ${info.width}x${info.height}`);

  // Check capital 'P' column around x = 270-320
  let pMinY = info.height, pMaxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 230; x < 350; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 100) {
        if (y < pMinY) pMinY = y;
        if (y > pMaxY) pMaxY = y;
      }
    }
  }
  console.log(`Capital P top: y=${pMinY}, bottom: y=${pMaxY}, height=${pMaxY - pMinY + 1}px`);
  console.log(`Total logo height: ${info.height}px`);
  console.log(`Capital P is ${((pMaxY - pMinY + 1) / info.height * 100).toFixed(1)}% of total height!`);
}

inspectRendered();
