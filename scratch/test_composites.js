const sharp = require('sharp');

async function testComposites() {
  const logo = sharp('public/images/logo-exact.png');
  const meta = await logo.metadata();

  // Test on white background
  await sharp({
    create: {
      width: meta.width + 40,
      height: meta.height + 40,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: 'public/images/logo-exact.png', top: 20, left: 20 }])
  .png()
  .toFile('scratch/test-on-white.png');

  // Test on dark background (#181116)
  await sharp({
    create: {
      width: meta.width + 40,
      height: meta.height + 40,
      channels: 4,
      background: { r: 24, g: 17, b: 22, alpha: 1 }
    }
  })
  .composite([{ input: 'public/images/logo-exact.png', top: 20, left: 20 }])
  .png()
  .toFile('scratch/test-on-dark.png');

  console.log('Composites created successfully!');
}

testComposites();
