const fs = require('fs');
const html = fs.readFileSync('scratch/chitchat.html', 'utf8');

const idx = html.indexOf('where you from');
console.log('=== CHAT SNIPPET ===');
console.log(html.slice(Math.max(0, idx - 1500), idx + 2500));

console.log('=== MP4 MATCHES ===');
const mp4Matches = html.match(/[^"'\s<>]+\.mp4/g) || [];
console.log(Array.from(new Set(mp4Matches)));

console.log('=== WEBCAM/VIDEO CARDS SNIPPET ===');
const videoIdx = html.indexOf('Chloe');
console.log(html.slice(Math.max(0, videoIdx - 1000), videoIdx + 1500));
