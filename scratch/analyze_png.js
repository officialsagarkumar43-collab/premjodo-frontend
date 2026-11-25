const sharp = require('sharp');

async function analyze() {
  const imgPath = 'C:/Users/adars/.gemini/antigravity/brain/9e49b4a0-07ef-4637-9b9b-e0a044c6f1e2/.user_uploaded/media_1795534996013_80f6ecb4.png';
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  console.log(`Channels: ${info.channels}, width: ${info.width}, height: ${info.height}`);

  const colorCounts = {};
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    // quantize slightly to group anti-aliased pixels
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }

  const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
  console.log('Top colors:');
  sorted.slice(0, 25).forEach(([hex, count]) => {
    console.log(`${hex}: ${count} (${((count / (info.width * info.height)) * 100).toFixed(2)}%)`);
  });

  // Let's sample specific coordinates:
  // Background:
  function getPixel(x, y) {
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  console.log('Background at (10, 10):', getPixel(10, 10));
  // Pink head center is around x=83, y=52
  console.log('Pink head around (83, 52):', getPixel(83, 52));
  // Blue head center is around x=230, y=52
  console.log('Blue head around (230, 52):', getPixel(230, 52));
  // Pink heart half center around (95, 180)
  console.log('Pink body around (95, 180):', getPixel(95, 180));
  // Blue heart half center around (215, 180)
  console.log('Blue body around (215, 180):', getPixel(215, 180));
  // Text 'prem' center around (450, 170)
  console.log('Text prem around (450, 170):', getPixel(450, 170));
  // Text 'jodo' center around (750, 170)
  console.log('Text jodo around (750, 170):', getPixel(750, 170));
}

analyze();
