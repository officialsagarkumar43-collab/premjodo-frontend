const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Generate 48x48 RGBA bitmap with Prem Jodo gradient and heart icon
const width = 48;
const height = 48;
const rawData = Buffer.alloc(width * height * 4);

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  rawData[idx] = r;
  rawData[idx + 1] = g;
  rawData[idx + 2] = b;
  rawData[idx + 3] = a;
}

// Draw rounded rectangle with rose -> pink -> amber gradient
const radius = 12;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Check rounded corner distance
    let inside = true;
    const cornerX = x < radius ? radius - x : (x >= width - radius ? x - (width - radius - 1) : 0);
    const cornerY = y < radius ? radius - y : (y >= height - radius ? y - (height - radius - 1) : 0);
    if (cornerX > 0 && cornerY > 0) {
      if (cornerX * cornerX + cornerY * cornerY > radius * radius) {
        inside = false;
      }
    }
    
    if (inside) {
      // Diagonal gradient from bottom-left (#e11d48) to top-right (#f59e0b)
      const t = (x + (height - y)) / (width + height);
      let r, g, b;
      if (t < 0.5) {
        const factor = t / 0.5;
        r = Math.round(225 + (236 - 225) * factor);
        g = Math.round(29 + (72 - 29) * factor);
        b = Math.round(72 + (153 - 72) * factor);
      } else {
        const factor = (t - 0.5) / 0.5;
        r = Math.round(236 + (245 - 236) * factor);
        g = Math.round(72 + (158 - 72) * factor);
        b = Math.round(153 + (11 - 153) * factor);
      }
      setPixel(x, y, r, g, b, 255);
    } else {
      setPixel(x, y, 0, 0, 0, 0);
    }
  }
}

// Draw a white heart shape in the center
function isInsideHeart(x, y) {
  // Normalize to -1.3 .. 1.3
  const nx = (x - 24) / 14;
  const ny = -(y - 23) / 14; // flip y
  // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const a = nx * nx + ny * ny - 1;
  return (a * a * a - nx * nx * ny * ny * ny) <= 0;
}

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (isInsideHeart(x, y)) {
      // Golden / White Heart with glow
      const idx = (y * width + x) * 4;
      if (rawData[idx + 3] > 0) {
        // Blended white heart
        setPixel(x, y, 255, 255, 255, 240);
      }
    }
  }
}

// Add golden dot on top right
for (let y = 5; y <= 11; y++) {
  for (let x = 37; x <= 43; x++) {
    const dx = x - 40;
    const dy = y - 8;
    if (dx * dx + dy * dy <= 9) {
      setPixel(x, y, 245, 158, 11, 255);
    }
  }
}

// Convert RGBA to PNG format
function createPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    // Simple CRC32
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < typeBuf.length; i++) {
      crc = crcTable[(crc ^ typeBuf[i]) & 0xff] ^ (crc >>> 8);
    }
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }
  
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  
  // IDAT chunk (scanline filter byte 0 + RGBA)
  const scanlineSize = width * 4 + 1;
  const rawScanlines = Buffer.alloc(height * scanlineSize);
  for (let y = 0; y < height; y++) {
    rawScanlines[y * scanlineSize] = 0; // None filter
    rgbaBuffer.copy(rawScanlines, y * scanlineSize + 1, y * width * 4, (y + 1) * width * 4);
  }
  
  const compressed = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createPNG(width, height, rawData);

// Create ICO container containing the PNG
function createICO(pngData, w, h) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(1, 4); // 1 image
  
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(w, 0);
  dirEntry.writeUInt8(h, 1);
  dirEntry.writeUInt8(0, 2); // colors
  dirEntry.writeUInt8(0, 3); // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bpp
  dirEntry.writeUInt32LE(pngData.length, 8); // size
  dirEntry.writeUInt32LE(22, 12); // offset (6 + 16)
  
  return Buffer.concat([header, dirEntry, pngData]);
}

const icoBuffer = createICO(pngBuffer, width, height);

// Write to public/favicon.ico and public/favicon.png
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '../public/favicon.png'), pngBuffer);
fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), pngBuffer);
console.log('Successfully generated Prem Jodo favicon.ico and favicon.png');
