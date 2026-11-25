const fs = require('fs');

// We can read PNG dimensions from header (bytes 16-24)
const buf = fs.readFileSync('C:/Users/adars/.gemini/antigravity/brain/9e49b4a0-07ef-4637-9b9b-e0a044c6f1e2/.user_uploaded/media_1795533094493_13873f97.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log(`Image dimensions: ${width}x${height}`);
