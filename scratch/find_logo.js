const fs = require('fs');
const html = fs.readFileSync('scratch/chitchat.html', 'utf8');
const idx = html.indexOf('id="i-logo"');
const endIdx = html.indexOf('</symbol>', idx);
console.log(html.slice(idx - 10, endIdx + 9));
